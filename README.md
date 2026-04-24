# 🤖 Agent Studio

**Agent Studio** is a high-fidelity RAG (Retrieval-Augmented Generation) platform designed to turn any website into a searchable, interactive knowledge base. Built with Next.js, Supabase, and Google Gemini, it handles large-scale data ingestion using dynamic overlapping chunking to ensure 100% accuracy in AI responses.



## 🚀 Key Features

- **🌐 Deep Web Ingestion**: Seamlessly scrapes and crawls complex websites using Firecrawl.
- **🛡️ Native Fallback Engine**: Specialized "Browser Masking" logic to bypass bot-detection on high-security sites like Wikipedia.
- **🧠 Neural Vector Search**: Implements `gemini-embedding-2-preview` with a 768-dimension vector space for high-precision retrieval.
- **🧩 Overlapping Chunking**: Smart text segmentation (4000 chars w/ 400 char overlap) to preserve context across sections.
- **📍 Source Citations**: Every AI response includes clickable, verified links to the exact source documentation.
- **🎨 Terminal UI**: A sleek, monospace-focused interface with live system logs and typing animations.

## 🛠️ The Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide React
- **LLM**: Google Gemini 3 Flash
- **Database**: Supabase (PostgreSQL + pgvector)
- **Scraping**: Firecrawl SDK + Native Fetch API
- **Formatting**: React-Markdown with syntax highlighting

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
⚙️ Installation & Setup
Clone the repository:

Bash
git clone [https://github.com/YOUR_USERNAME/agent-studio.git](https://github.com/YOUR_USERNAME/agent-studio.git)
cd agent-studio
Install dependencies:

Bash
npm install
Configure Environment Variables:
Create a .env.local file in the root directory:

Code snippet
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FIRECRAWL_API_KEY=your_firecrawl_key
GOOGLE_GENERATION_AI_API_KEY=your_gemini_key
Initialize Supabase Schema:
Run the following SQL in your Supabase SQL Editor:

SQL
-- Enable pgvector extension
create extension if not exists vector;

-- Create documents table
create table documents (
  id bigserial primary key,
  content text,
  metadata jsonb,
  embedding vector(768)
);

-- Create search function
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
Run the development server:

Bash
npm run dev
📜 License
Distributed under the MIT License. See LICENSE for more information.

Developed with ❤️ by [Your Name]```
