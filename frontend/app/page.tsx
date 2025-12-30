"use client";

import { useSelector } from "react-redux";
import { Bot, Loader2 } from "lucide-react";
import { RootState } from "@/lib/store";
import { Chatbox } from "@/components/chatbox";

export default function Chat() {
  const { messages, isLoading } = useSelector((state: RootState) => state.chat);

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white font-sans antialiased">
      {/* --- HEADER --- */}
      <div className="flex-none items-center gap-2 px-2 py-2 justify-center flex">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Bot className="size-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">RAGis</span>
          <span className="text-xs">RAG AI Assistent</span>
        </div>
      </div>

      {/* --- MESSAGES AREA (Scrollbar) --- */}

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

      {/* --- INPUT AREA (Chatbox) --- */}

      <Chatbox />
    </div>
  );
}
