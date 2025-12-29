"use client";

import { useState } from "react";
import { Bot, Loader2 } from "lucide-react";

export default function Chat() {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "What would you like to know?" },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    setIsLoading(true);

    const userMessage = { role: "user", text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");

    try {
      const response = await fetch("http://localhost:8000", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: currentInput }),
      });

      if (!response.ok) throw new Error("Serverfel");

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Kunde inte ansluta till RAGis-servern." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white font-sans antialiased">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-2 px-2 py-2 justify-center">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Bot className="size-4" />
        </div>
        <div className="flex flex-col group-data-[collapsible=icon]:hidden">
          <span className="text-sm font-semibold">RAGis</span>
          <span className="text-xs">RAG AI Assistent</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 w-full max-w-2xl mx-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 px-4 rounded-2xl text-[15px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-zinc-800 text-zinc-100 rounded-tl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 text-zinc-100 p-3 px-4 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 pb-8 bg-zinc-900">
        <div className="pr-4 h-15 max-w-2xl w-full mx-auto flex gap-2 items-center bg-zinc-950 border border-white/10 p-1.5 pl-4 rounded-full focus-within:border-white/20 transition-all">
          <input
            type="text"
            placeholder="Ask something..."
            className="flex-1 text-white bg-transparent py-2 outline-none text-[15px] placeholder:text-zinc-500"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="bg-zinc-100 text-black h-8 w-8 flex items-center justify-center rounded-full hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-black" />
            ) : (
              <span className="text-xl mb-0.5">↑</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
