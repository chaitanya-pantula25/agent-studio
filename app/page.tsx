"use client";

import { useState } from "react";
import ChatInterface from "./components/ChatInterface";

export default function Home() {
  const [url, setUrl] = useState("");
  const [isTraining, setIsTraining] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "", pages: 0 });

  const handleTrain = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTraining(true);
    setStatus({ type: "info", message: "INITIALIZING CRAWLER_V3...", pages: 0 });

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      setStatus({ 
        type: "success", 
        message: "INGESTION_COMPLETE. NEURAL_VECTORS UPDATED.",
        pages: data.pagesIndexed || 0
      });
      setUrl("");
    } catch (err: any) {
      setStatus({ type: "error", message: "SYSTEM_FAILURE: " + err.message, pages: 0 });
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8 font-mono">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 pt-10">
        
        {/* Left Side: Setup & Status */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
              AGENT_STUDIO
            </h1>
            <p className="text-slate-500 text-lg font-medium italic">
              [Phase 01]: Data Ingestion & Vectorization
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-900"></div>
            <h2 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest underline">
              Target_Input
            </h2>
            
            <form onSubmit={handleTrain} className="space-y-4">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-3 rounded-xl focus-within:ring-2 focus-within:ring-slate-900 transition-all">
                <span className="text-slate-400 text-xs">$ URL:</span>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="bg-transparent w-full outline-none text-slate-700 text-sm"
                  required
                />
              </div>
              <button
                disabled={isTraining}
                className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isTraining ? (
                  <>
                    <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                    EXECUTING_CRAWL...
                  </>
                ) : (
                  "START INGESTION"
                )}
              </button>
            </form>

            {status.message && (
              <div className={`mt-8 p-4 rounded-xl border text-[11px] leading-relaxed ${
                status.type === "success" ? "bg-green-50 border-green-200 text-green-700" : 
                status.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-blue-50 border-blue-200 text-blue-700"
              }`}>
                <p className="font-bold mb-2">SYSTEM_LOG:</p>
                <p>{">"} {status.message}</p>
                {status.pages > 0 && <p>{">"} PAGES_INDEXED: {status.pages}</p>}
                {status.type === "success" && (
                  <div className="mt-4 pt-3 border-t border-green-200/50 flex gap-6 text-[9px] uppercase font-bold opacity-70">
                    <span>DIM: 768</span>
                    <span>MODEL: GEMINI_3</span>
                    <span>LOC: US-CENTRAL-1</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Chat Interface */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase ml-2 tracking-widest underline">
            [Phase 02]: Neural_Interaction
          </h2>
          <ChatInterface />
        </div>

      </div>
    </main>
  );
}