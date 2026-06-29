# Understanding RAG from Scratch

## Overview
Retrieval-Augmented Generation (RAG) is a pattern that allows Large Language Models (LLMs) to access external data before generating a response. Instead of fine-tuning a model on your private data, RAG retrieves relevant context and injects it into the prompt.

> [!TIP]
> RAG is significantly cheaper and faster to implement than full model fine-tuning for most enterprise use cases.

## Why it matters
LLMs are powerful, but they suffer from hallucinations and knowledge cutoffs. They don't know your private database schema, your internal documentation, or today's news.

RAG solves this by decoupling **knowledge** from the **reasoning engine**. The LLM acts purely as a reasoning engine, processing the knowledge you retrieve for it.

## How it works
The standard RAG pipeline consists of two main phases: **Ingestion** and **Retrieval**.

### 1. Ingestion
1. **Chunking**: Break large documents into smaller pieces (chunks).
2. **Embedding**: Convert text chunks into high-dimensional vectors.
3. **Storage**: Save the vectors and metadata in a Vector Database.

```python
from sentence_transformers import SentenceTransformer
import pinecone

model = SentenceTransformer('all-MiniLM-L6-v2')
chunks = ["This is a document about RAG.", "Pinecone is a vector DB."]
embeddings = model.encode(chunks)

# Store in Vector DB
index = pinecone.Index("my-rag-index")
index.upsert(vectors=zip(["id1", "id2"], embeddings, [{"text": c} for c in chunks]))
```

### 2. Retrieval
When a user asks a question, the system embeds the query using the *same* model, and performs a semantic search in the Vector Database.

## Example
Imagine the user asks: "What is the return policy?"

1. The query is embedded: `[0.1, -0.4, 0.8, ...]`.
2. The Vector DB returns chunks like: "Items can be returned within 30 days..."
3. The prompt becomes:
   ```text
   Context: Items can be returned within 30 days...
   Query: What is the return policy?
   Answer:
   ```

> [!WARNING]
> If your retrieval fails to find the right chunk, the LLM cannot answer correctly. Retrieval quality is the most critical part of a RAG pipeline.

## Best Practices
- **Chunk Size**: Experiment with chunk sizes. 512 tokens is a good starting point.
- **Overlap**: Add 10-20% overlap between chunks so context isn't lost at boundaries.
- **Hybrid Search**: Combine vector (semantic) search with keyword (BM25) search for better recall.

## Common Mistakes
- ❌ Indexing raw PDFs without cleaning the text first.
- ❌ Relying solely on vector similarity when exact keyword matching is needed (e.g., finding a specific ID).
- ❌ Passing too much context to the LLM, leading to the "lost in the middle" phenomenon.

## Further Reading
- [Pinecone RAG Tutorial](https://www.pinecone.io/learn/retrieval-augmented-generation/)
- [OpenAI Embeddings API](https://platform.openai.com/docs/guides/embeddings)
