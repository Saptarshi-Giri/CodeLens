<div align="center">

# CodeLens — AI Codebase Debugger

**Load any GitHub repository. Ask questions. Understand code instantly.**

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat&logo=fastapi&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-F55036?style=flat)
![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_DB-FF6B35?style=flat)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

</div>

---

## Overview

CodeLens is a full-stack AI-powered application that lets developers interact with any GitHub repository using plain English. Instead of manually navigating through hundreds of files, simply paste a repository URL and start asking questions — CodeLens retrieves the most relevant code and delivers precise, context-aware answers powered by Groq's blazing-fast LLaMA 3.3 70B model.

Built on **Retrieval-Augmented Generation (RAG)**, CodeLens chunks your codebase into meaningful segments, embeds them into a vector space, and performs semantic search to ground every answer in actual code — not hallucinations.

---

## Features

- **Natural language Q&A** — Ask anything about the codebase in plain English
- **Bug detection** — Identify potential issues and get fix suggestions
- **Multi-repo support** — Load and switch between multiple repositories in one session
- **File explorer** — Browse all indexed files in the sidebar
- **Download ZIP** — Download the entire cloned repository as a ZIP file
- **Dark / Light mode** — Toggle between themes with one click
- **Real-time progress** — Live status updates while the repo is being indexed
- **Code-aware chunking** — Language-specific splitting for Python, JS, TS, Java, C++, Go, Rust

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, inline CSS |
| Backend | FastAPI, Uvicorn |
| LLM | Groq — LLaMA 3.3 70B Versatile |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| Vector DB | ChromaDB (persistent) |
| Code Parsing | LangChain RecursiveCharacterTextSplitter |
| Repo Ingestion | GitPython |

---

## Architecture

| Step | Component | Description |
|------|-----------|-------------|
| 1 | `github_loader.py` | Clones the repository and collects all code files |
| 2 | `code_chunker.py` | Splits files into meaningful chunks by language |
| 3 | `embedder.py` | Converts chunks into vector embeddings |
| 4 | `ChromaDB` | Stores and indexes all embeddings |
| 5 | `searcher.py` | Embeds the user query and retrieves top-k chunks |
| 6 | `qa_chain.py` | Sends chunks + question to Groq LLaMA 3.3 70B |
| 7 | Response | Returns explanation, bug detection, and suggestions |

**Flow:** `GitHub URL` → `Clone` → `Chunk` → `Embed` → `Store` → `Query` → `Retrieve` → `LLM` → `Answer`

---

## Project Structure

```
CodeLens/
├── backend/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       └── components/
│           ├── TopBar.jsx
│           ├── Sidebar.jsx
│           ├── ChatPanel.jsx
│           └── LoaderModal.jsx
├── ingest/
│   ├── github_loader.py
│   ├── code_chunker.py
│   ├── embedder.py
│   └── model.py
├── retrieval/
│   ├── vector_store.py
│   └── searcher.py
├── llm/
│   └── qa_chain.py
├── .gitignore
├── requirements.txt
└── README.md
```

---



## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A [Groq API key](https://console.groq.com) (free)

### 1. Clone the repository

```bash
git clone https://github.com/Saptarshi-Giri/CodeLens.git
cd CodeLens
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the backend

```bash
uvicorn backend.main:app --reload --port 8000
```

### 5. Install and start the frontend

```bash
cd frontend
npm install
npm run dev
```

### 6. Open in your browser

http://localhost:5173

---

## Usage

1. Paste any public GitHub repository URL into the top bar
2. Click **Load repo** and watch the real-time progress modal
3. Once indexed, ask any question about the codebase in the chat
4. Use the **Download ZIP** button in the sidebar to download the full repository
5. Load multiple repos and switch between them using the sidebar
6. Toggle between dark and light mode using the button in the top bar

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/load` | Clone and index a GitHub repository |
| `GET` | `/api/status/{session_id}` | Poll indexing progress |
| `POST` | `/api/ask` | Ask a question about the loaded repo |
| `GET` | `/api/download/{session_id}` | Download repo as ZIP |
| `GET` | `/api/sessions` | List all active sessions |
| `DELETE` | `/api/session/{session_id}` | Remove a session |

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `GROQ_API_KEY` | Your Groq API key from console.groq.com | Yes |

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Author

**Saptarshi Giri**
- GitHub: [@Saptarshi-Giri](https://github.com/Saptarshi-Giri)

---

<div align="center">
  <sub>Built with React, FastAPI, Groq, and ChromaDB</sub>
</div>

