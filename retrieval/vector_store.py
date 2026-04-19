import chromadb

def get_client():
    return chromadb.Client()

def get_collection(collection_name="codebase"):
    client = get_client()
    return client.get_or_create_collection(collection_name)

def reset_collection(collection_name="codebase"):
    client = get_client()
    try:
        client.delete_collection(collection_name)
    except Exception:
        pass