"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "ai";
  text: string;
  sources?: string[];
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Simple notification logic
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();
      
      setMessages((prev) => [...prev, { 
        role: "ai", 
        text: data.text, 
        sources: data.sources 
      }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "ai", text: "[SYSTEM_ERROR]: " + err.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full border rounded-2xl bg-white shadow-2xl overflow-hidden font-mono">
      {/* Terminal Header */}
      <div className="p-4 border-b bg-slate-900 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
          </div>
          <span className="text-xs font-bold tracking-widest opacity-80 underline decoration-slate-600">LIVE_AGENT_SESSION</span>
        </div>
        <span className="text-[10px] opacity-40">UTC_042426</span>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
        {messages.length === 0 && (
          <div className="text-center text-slate-300 mt-24 text-xs italic">
            <p>[SYSTEM]: NO_CONVERSATION_HISTORY_FOUND</p>
            <p>AWAITING_INPUT_COMMAND...</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div className="group relative max-w-[90%]">
              
              {/* Copy Action */}
              {msg.role === 'ai' && (
                <button 
                  onClick={() => copyToClipboard(msg.text)}
                  className="absolute -top-3 -right-3 bg-white border border-slate-200 text-[9px] px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-all font-bold hover:bg-slate-50 z-20"
                >
                  [COPY]
                </button>
              )}

              <div className={`p-4 rounded-xl border ${
                msg.role === "user" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-800 border-slate-200"
              } shadow-sm`}>
                <div className="prose prose-sm prose-slate max-w-none text-sm leading-relaxed">
                  <ReactMarkdown 
                    components={{
                      p: ({node, ...props}) => <div className="mb-2 last:mb-0" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc ml-4 space-y-1 my-2" {...props} />,
                      a: ({node, ...props}) => <a className="text-blue-600 underline" target="_blank" {...props} />
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>

                {/* Citations / Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-2">Verified_Sources:</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((src, idx) => (
                        <a 
                          key={idx} 
                          href={src} 
                          target="_blank" 
                          className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200 px-2 py-0.5 rounded transition-colors truncate max-w-[140px]"
                        >
                          {src.split('/').pop() || 'ROOT'}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm text-slate-400 text-[10px] flex items-center gap-2 tracking-widest">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-ping"></span>
              THINKING...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Terminal */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-lg border border-transparent focus-within:border-slate-200 px-3">
          <span className="text-slate-400 font-bold text-xs">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your query..."
            className="w-full py-2 bg-transparent outline-none text-slate-700 text-sm"
          />
        </div>
        <button 
          type="submit" 
          className="bg-slate-900 text-white px-5 py-2 rounded-lg font-bold hover:bg-black transition-all text-[10px] uppercase tracking-widest"
        >
          Execute
        </button>
      </form>
    </div>
  );
}