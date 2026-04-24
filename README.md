# 🤖 Agent Studio

**Agent Studio** is a high-fidelity RAG (Retrieval-Augmented Generation) platform designed to turn any website into a searchable, interactive knowledge base. Built with Next.js, Supabase, and Google Gemini, it handles large-scale data ingestion using dynamic overlapping chunking to ensure 100% accuracy in AI responses.

## 🚀 Key Features

- **🌐 Deep Web Ingestion**: Seamlessly scrapes and crawls complex websites using Firecrawl.
- **🛡️ Native Fallback Engine**: Specialized "Browser Masking" logic to bypass bot-detection on high-security sites like Wikipedia.
- **🧠 Neural Vector Search**: Implements gemini-embedding-2-preview with a 768-dimension vector space.
- **🧩 Overlapping Chunking**: Smart text segmentation (4000 chars w/ 400 char overlap) to preserve context.
- **📍 Source Citations**: Every AI response includes clickable, verified links to the source.
- **🎨 Terminal UI**: A sleek, monospace-focused interface with live system logs.

## 📖 Usage Examples

### 📚 Technical Documentation (Next.js)
- **Input URL:** `https://nextjs.org/docs/app/building-your-application/routing`
- **Query:** "How does the App Router handle nested layouts?"
- **AI Response:** Provides a precise technical summary based on the official documentation, including folder structure and `layout.js` behavior.

### 🏛️ Historical Deep-Dives (Roman Empire)
- **Input URL:** `https://en.wikipedia.org/wiki/Roman_Empire`
- **Query:** "What were the primary reasons for the Crisis of the Third Century?"
- **AI Response:** Synthesizes multiple historical factors (civil war, plague, economic depression) found across different sections of the 200k+ character article.

### 🔬 Scientific Research (NASA)
- **Input URL:** `https://www.nasa.gov/mission_pages/webb/main/index.html`
- **Query:** "What are the primary mission goals of the James Webb Space Telescope?"
- **AI Response:** Extracts specific mission objectives (observing the first light from stars, studying galaxy assembly) directly from the current NASA mission page.

## 🛠️ The Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide React
- **LLM**: Google Gemini 3 Flash
- **Database**: Supabase (PostgreSQL + pgvector)
- **Scraping**: Firecrawl SDK + Native Fetch API

## 📂 Project Structure

```text
├── app/
│   ├── api/
│   │   ├── chat/         # RAG logic & Gemini integration
│   │   └── scrape/       # Crawling & Vectorization engine
│   └── page.tsx          # Main dashboard UI
├── components/
│   └── ChatInterface.tsx # Interactive terminal component
├── lib/
│   └── supabase.ts       # Supabase client configuration
└── README.md
```

## ⚙️ Installation & Setup

1. Clone the repository:
```
   git clone https://github.com/YOUR_USERNAME/agent-studio.git
   
   cd agent-studio
   ```

2. Install dependencies:
```
   npm install
```
3. Configure Environment Variables (.env.local):
```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url

   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

   FIRECRAWL_API_KEY=your_firecrawl_key

   GOOGLE_GENERATION_AI_API_KEY=your_gemini_key
   ```

4. Run the development server:
```
   npm run dev
```

## 🗄️ Supabase Setup

Run the following SQL in your **Supabase SQL Editor** to initialize the vector database and the search function.

```sql
-- 1. Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- 2. Create the documents table
create table documents (
  id bigserial primary key,
  content text,
  metadata jsonb,
  embedding vector(768) -- Matches Gemini's 768-dim output
);

-- 3. Create the RAG search function (Cosine Similarity)
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
) language plpgsql as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
end;
$$;
```

---
**Developed by Chaitanya Pantula**
