import { NextResponse } from 'next/server';
import FirecrawlApp from '@mendable/firecrawl-js';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATION_AI_API_KEY;
    const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    // 1. SCRAPE & CLEAN
    console.log(`[1/4] Scraping: ${url}`);
    let fullText = "";

    try {
      const scrapeResponse: any = await (app as any).scrape(url, { 
        formats: ['markdown'],
        onlyMainContent: true 
      });
      if (scrapeResponse?.success) {
        fullText = scrapeResponse.data?.markdown || scrapeResponse.markdown;
      }
    } catch (e) {
      console.log("Firecrawl throttled, attempting Native Fetch...");
    }

    // FALLBACK
    if (!fullText) {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' }
      });
      const html = await res.text();
      fullText = html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ');
    }

    if (!fullText || fullText.length < 100) throw new Error("Content too short or unavailable.");

    // CLEANING CITATIONS
    fullText = fullText.replace(/\[\d+\]/g, ''); 

    // 2. WIPE PREVIOUS DATA
    await supabaseAdmin.from('documents').delete().not('id', 'is', null);

    // 3. FULL-PAGE DYNAMIC CHUNKING
    const chunkSize = 4000;
    const overlap = 400;
    const chunks = [];

    // Removed the .substring() limit - we process everything now
    for (let i = 0; i < fullText.length; i += (chunkSize - overlap)) {
      const chunk = fullText.substring(i, i + chunkSize);
      if (chunk.length > 150) chunks.push(chunk);
    }

    console.log(`[3/4] Indexing ${chunks.length} chunks from the entire document...`);

    // 4. EMBED & SAVE
    for (const chunk of chunks) {
      const embedRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2-preview:embedContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: { parts: [{ text: chunk }] },
            outputDimensionality: 768 
          })
        }
      );
      const embedData = await embedRes.json();
      if (!embedRes.ok) continue;

      await supabaseAdmin.from('documents').insert({
        content: chunk,
        metadata: { url, title: "Web Context" },
        embedding: embedData.embedding.values 
      });
    }

    return NextResponse.json({ 
      message: "Full document indexed successfully.", 
      pagesIndexed: chunks.length 
    });

  } catch (error: any) {
    console.error("SCRAPE_CRITICAL_FAILURE:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}