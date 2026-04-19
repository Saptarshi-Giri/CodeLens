from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import uuid
import os
import sys
import zipfile
import io

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ingest.github_loader import clone_repo, get_code_files
from ingest.code_chunker import chunk_repo
from ingest.embedder import build_vector_store
from retrieval.vector_store import get_collection, reset_collection
from llm.qa_chain import ask

app = FastAPI(title="Codebase Q&A API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store
sessions: dict = {}


class LoadRepoRequest(BaseModel):
    repo_url: str


class QuestionRequest(BaseModel):
    session_id: str
    question: str


class SessionStatus(BaseModel):
    session_id: str
    status: str
    repo_url: Optional[str] = None
    file_count: Optional[int] = None
    chunk_count: Optional[int] = None
    files: Optional[list[str]] = None
    error: Optional[str] = None


def process_repo(session_id: str, repo_url: str):
    try:
        sessions[session_id]["status"] = "cloning"
        repo_path = clone_repo(repo_url)

        sessions[session_id]["status"] = "chunking"
        files = get_code_files(repo_path)
        chunks = chunk_repo(repo_path)

        sessions[session_id]["status"] = "embedding"
        collection_name = f"repo_{session_id}"
        reset_collection(collection_name)
        collection = build_vector_store(chunks, collection_name)

        sessions[session_id].update({
            "status": "ready",
            "collection": collection,
            "file_count": len(files),
            "chunk_count": len(chunks),
            "files": [os.path.relpath(f, repo_path) for f in files],
            "repo_path": repo_path,
        })
    except Exception as e:
        sessions[session_id]["status"] = "error"
        sessions[session_id]["error"] = str(e)


@app.post("/api/load")
async def load_repo(req: LoadRepoRequest, background_tasks: BackgroundTasks):
    session_id = uuid.uuid4().hex[:10]
    sessions[session_id] = {
        "status": "queued",
        "repo_url": req.repo_url,
        "collection": None,
        "file_count": None,
        "chunk_count": None,
        "files": [],
        "error": None,
    }
    background_tasks.add_task(process_repo, session_id, req.repo_url)
    return {"session_id": session_id}


@app.get("/api/status/{session_id}", response_model=SessionStatus)
async def get_status(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    s = sessions[session_id]
    return SessionStatus(
        session_id=session_id,
        status=s["status"],
        repo_url=s.get("repo_url"),
        file_count=s.get("file_count"),
        chunk_count=s.get("chunk_count"),
        files=s.get("files", []),
        error=s.get("error"),
    )


@app.post("/api/ask")
async def ask_question(req: QuestionRequest):
    if req.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    s = sessions[req.session_id]
    if s["status"] != "ready":
        raise HTTPException(status_code=400, detail=f"Repo not ready. Status: {s['status']}")

    collection = s["collection"]
    if not collection:
        raise HTTPException(status_code=400, detail="No collection loaded")

    try:
        answer = ask(collection, req.question)
        return {"answer": answer, "status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/sessions")
async def list_sessions():
    return [
        {"session_id": sid, "status": s["status"], "repo_url": s.get("repo_url")}
        for sid, s in sessions.items()
    ]


@app.delete("/api/session/{session_id}")
async def delete_session(session_id: str):
    if session_id in sessions:
        del sessions[session_id]
    return {"ok": True}


@app.get("/api/download/{session_id}")
async def download_repo(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    s = sessions[session_id]
    if s["status"] != "ready":
        raise HTTPException(status_code=400, detail="Repo not ready yet")

    repo_path = s.get("repo_path")
    if not repo_path or not os.path.exists(repo_path):
        raise HTTPException(status_code=404, detail="Repo folder not found on disk")

    # Zip the entire repo folder in memory
    zip_buffer = io.BytesIO()
    repo_name = s.get("repo_url", "repo").rstrip("/").split("/")[-1]

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(repo_path):
            # Skip .git folder to keep the zip clean
            dirs[:] = [d for d in dirs if d != ".git"]
            for file in files:
                full_path = os.path.join(root, file)
                arcname = os.path.join(repo_name, os.path.relpath(full_path, repo_path))
                zf.write(full_path, arcname)

    zip_buffer.seek(0)

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={repo_name}.zip"},
    )


@app.get("/")
def root():
    return {"message": "Codebase Q&A API running"}
