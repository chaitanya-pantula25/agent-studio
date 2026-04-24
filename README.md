# 🤖 Agent Studio

**Agent Studio** is a high-fidelity RAG (Retrieval-Augmented Generation) platform designed to turn any website into a searchable, interactive knowledge base. Built with Next.js, Supabase, and Google Gemini, it handles large-scale data ingestion using dynamic overlapping chunking to ensure 100% accuracy in AI responses.

## 🚀 Key Features

- **🌐 Deep Web Ingestion**: Seamlessly scrapes and crawls complex websites using Firecrawl.
- **🛡️ Native Fallback Engine**: Specialized "Browser Masking" logic to bypass bot-detection on high-security sites like Wikipedia.
- **🧠 Neural Vector Search**: Implements gemini-embedding-2-preview with a 768-dimension vector space.
- **🧩 Overlapping Chunking**: Smart text segmentation (4000 chars w/ 400 char overlap) to preserve context.
- **📍 Source Citations**: Every AI response includes clickable, verified links to the source.
- **🎨 Terminal UI**: A sleek, monospace-focused interface with live system logs.

## 🛠️ The Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide React
- **LLM**: Google Gemini 3 Flash
- **Database**: Supabase (PostgreSQL + pgvector)
- **Scraping**: Firecrawl SDK + Native Fetch API

## 📂 Project Structure

app/
├── api/
│   ├── chat/         # RAG logic & Gemini integration
│   └── scrape/       # Crawling & Vectorization engine
└── page.tsx          # Main dashboard UI
components/
└── ChatInterface.tsx # Interactive terminal component
lib/
└── supabase.ts       # Supabase client configuration

## ⚙️ Installation & Setup

1. Clone the repository:

   git clone https://github.com/YOUR_USERNAME/agent-studio.git
   
   cd agent-studio

2. Install dependencies:

   npm install

3. Configure Environment Variables (.env.local):

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
FIRECRAWL_API_KEY=your_firecrawl_key
GOOGLE_GENERATION_AI_API_KEY=your_gemini_key

4. Initialize Supabase Schema:

   Run the SQL provided in the documentation to enable pgvector and create the match_documents function.

5. Run the development server:

   npm run dev

---
**Developed with ❤️ by Chaitanya Pantula**
