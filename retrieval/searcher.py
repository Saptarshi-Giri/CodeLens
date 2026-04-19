from ingest.model import embedding_model as model

def search(collection, query, top_k=3):
    query_embedding = model.encode([query]).tolist()

    # Clamp to avoid crash when fewer chunks exist than top_k
    count = collection.count()
    if count == 0:
        return []
    n = min(top_k, count)

    results = collection.query(
        query_embeddings=query_embedding,
        n_results=n
    )

    if not results or not results.get("documents"):
        return []

    docs = results["documents"][0]
    metas = results.get("metadatas", [[]])[0]

    return [
        f"FILE: {m.get('source', 'unknown')}\n{d}"
        for d, m in zip(docs, metas)
    ]