from ingest.model import embedding_model as model
from retrieval.vector_store import get_collection



def build_vector_store(chunks, collection_name="codebase"):
    collection = get_collection(collection_name)

    texts = [c["content"] for c in chunks]
    sources = [c["source"] for c in chunks]

    print("Generating embeddings locally...")

    embeddings = model.encode(texts, show_progress_bar=True).tolist()

    ids = [f"chunk_{i}" for i in range(len(chunks))]

    collection.add(
        documents=texts,
        embeddings=embeddings,
        metadatas=[{"source": s} for s in sources],
        ids=ids
    )

    print(f"Stored {len(chunks)} chunks.")

    return collection