"use client";

import { useState } from "react";

export default function Chat() {
  // --- 1. MINNET ---
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hej! Vad vill du veta om din data?" },
  ]);
  const [inputValue, setInputValue] = useState("");

  // --- 3. FUNKTIONEN FÖR ATT SKICKA ---
  const handleSend = () => {
    if (!inputValue.trim()) return; // Skicka inget om det är tomt

    // Lägg till det nya meddelandet i listan
    setMessages([...messages, { role: "user", text: inputValue }]);

    // Töm skrivrutan
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <div className="flex-1 max-w-2xl w-full mx-auto bg-white flex flex-col shadow-sm">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-bold text-gray-700">RAG Pipeline</h2>
        </div>

        {/* --- VISA MEDDELANDEN --- */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-2 px-4 rounded-lg ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl w-full mx-auto bg-white p-4 flex gap-2 border-t">
        <input
          type="text"
          placeholder="Skriv din fråga..."
          className="flex-1 border px-3 py-2 outline-none focus:border-blue-500"
          // --- 2. KOPPLING TILL INPUT ---
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()} // Skicka med Enter
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 cursor-pointer transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
