"use client";

import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([{ role: "ai", text: "Hej! Vad vill du veta?" }]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = { role: "user", text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue; // Spara undan värdet innan vi tömmer det
    setInputValue("");

    try {
      const response = await fetch("http://localhost:8000", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: currentInput }), // Skickar datan till FastAPI
      });

      if (!response.ok) throw new Error("Serverfel");

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Kunde inte ansluta till RAGis-servern." },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-yellow-100 text-white font-sans antialiased">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 w-full max-w-2xl mx-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
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
      </div>

      <div className="p-4 pb-8 bg-yellow-100">
        <div className="max-w-2xl w-full mx-auto flex gap-2 items-center bg-yellow-50 border border-white/10 p-1.5 pl-4 rounded-full focus-within:border-white/20 transition-all shadow-[5px_5px_0px_0px_rgba(0,0,255,1)]">
          <input
            type="text"
            placeholder="Fråga något..."
            className="flex-1 text-black bg-transparent py-2 outline-none text-[15px] placeholder:text-zinc-500"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-zinc-800 text-white h-8 w-8 flex items-center justify-center rounded-full hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            <span className="text-xl mb-0.5">↑</span>
          </button>
        </div>
      </div>
    </div>
  );
}
