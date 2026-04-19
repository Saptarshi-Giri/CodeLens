from sentence_transformers import SentenceTransformer

# Loaded once, shared across embedder and searcher
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")