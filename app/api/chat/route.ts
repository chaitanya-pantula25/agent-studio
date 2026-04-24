import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATION_AI_API_KEY;

    if (!message) return NextResponse.json({ error: "Query required" }, { status: 400 });

    // 1. GENERATE EMBEDDING
    const embedResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2-preview:embedContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { parts: [{ text: message }], role: 'user' },
          outputDimensionality: 768 
        })
      }
    );

    const embedData = await embedResponse.json();
    const queryEmbedding = embedData.embedding.values;

    // 2. VECTOR SEARCH (Optimized for Deep Retrieval)
    const { data: documents, error: matchError } = await supabaseAdmin.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.18, // Lowered to capture lists and names
      match_count: 12       // Increased to 12 chunks for maximum context
    });

    if (matchError) throw matchError;

    const contextText = documents?.map((doc: any) => doc.content).join('\n\n---\n\n') || "";
    const sources = Array.from(new Set(documents?.map((doc: any) => doc.metadata.url) || []));

    // 3. GENERATION
    const chatResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `
                Context from the source:
                ${contextText}

                Question: ${message}

                Instructions:
                - Use the context provided to answer accurately.
                - If the question asks for names or lists (like cricketers), scan the text thoroughly.
                - If information is missing, state clearly what you found and what is missing.
              `
            }]
          }]
        })
      }
    );

    const chatData = await chatResponse.json();

    return NextResponse.json({ 
      text: chatData.candidates[0].content.parts[0].text,
      sources: sources
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}