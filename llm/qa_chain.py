from groq import Groq
import os
from dotenv import load_dotenv
from retrieval.searcher import search

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MAX_CONTEXT_CHARS = 6000  # safe limit for Groq models

def ask(collection, question, model="llama-3.3-70b-versatile"):
    context_chunks = search(collection, question)

    if not context_chunks:
        return "No relevant code found in the repository."

    context = "\n\n---\n\n".join(context_chunks)
    context = context[:MAX_CONTEXT_CHARS]  # guard against context overflow

    prompt = f"""You are an expert software engineer and code debugger.

Analyze the code and answer:
- Explain clearly
- Identify bugs
- Suggest improvements

CODE:
{context}

QUESTION:
{question}"""

    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=1024,
    )
    return response.choices[0].message.content