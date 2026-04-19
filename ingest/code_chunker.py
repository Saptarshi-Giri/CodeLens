from langchain_text_splitters import Language, RecursiveCharacterTextSplitter
import os

VALID_EXTENSIONS = {".py", ".js", ".ts", ".java", ".cpp", ".c", ".go", ".rs"}

def chunk_file(filepath: str) -> list[dict]:
    ext = os.path.splitext(filepath)[-1]

    if ext not in VALID_EXTENSIONS:
        return []

    lang_map = {
    ".py": Language.PYTHON,
    ".js": Language.JS,
    ".ts": Language.JS,
    ".java": Language.JAVA,
    ".cpp": Language.CPP,
    ".c": Language.CPP,
    ".go": Language.GO,
    ".rs": Language.RUST,
    }

    splitter = RecursiveCharacterTextSplitter.from_language(
        language=lang_map.get(ext, Language.PYTHON),
        chunk_size=400,
        chunk_overlap=50
    )

    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            code = f.read()
    except Exception:
        return []

    docs = splitter.create_documents([code])

    return [
        {"content": d.page_content, "source": filepath}
        for d in docs
    ]

def chunk_repo(repo_path: str) -> list[dict]:
    from .github_loader import get_code_files

    chunks = []
    for file in get_code_files(repo_path):
        chunks.extend(chunk_file(file))

    return chunks