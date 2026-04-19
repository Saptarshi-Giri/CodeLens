import git, os, shutil, tempfile, uuid

IGNORE_DIRS = {".git", "node_modules", "venv", "__pycache__", ".idea", ".vscode"}
VALID_EXTENSIONS = (".py", ".js", ".ts", ".java", ".cpp", ".c", ".go", ".rs")

def clone_repo(repo_url: str) -> str:
    dest = tempfile.mkdtemp(prefix="repo_")
    try:
        git.Repo.clone_from(repo_url, dest)
        return dest
    except Exception as e:
        shutil.rmtree(dest, ignore_errors=True)
        raise Exception(f"Failed to clone repo: {str(e)}")

def get_code_files(repo_path: str) -> list[str]:
    files = []
    for root, dirs, filenames in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in filenames:
            if f.endswith(VALID_EXTENSIONS):
                files.append(os.path.join(root, f))
    return files