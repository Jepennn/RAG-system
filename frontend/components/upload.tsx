"use client";

import { useState, useRef } from "react"; // NYTT: lade till useRef
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // --- NYTT: State för att veta om man drar en fil över boxen ---
  const [isDragging, setIsDragging] = useState(false);
  // --- NYTT: Referens för att kunna klicka på den dolda knappen ---
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  // --- NYTT: Funktioner för Drag & Drop ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Måste finnas för att drop ska fungera
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Sparar filen som droppades precis som om man valt den via knappen
      setFile(e.dataTransfer.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      alert("Select a file!");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();

        window.location.reload();
      } else {
        toast("Failed to upload...");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col bg-transparent text-white font-sans antialiased">
      <div className="flex justify-center">
        {/* --- NYTT: Drop Zone Box --- */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()} // Gör att hela boxen går att klicka på
          className={`w-full max-w-lg border-2 border-dashed p-12 rounded-xl text-center transition-all cursor-pointer ${
            isDragging
              ? "border-blue-500 bg-blue-500/10"
              : "border-zinc-300 hover:bg-zinc-800"
          }`}
        >
          {/* NYTT: Inputen är nu gömd men triggas av boxen ovan */}
          <Input
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />

          <div className="space-y-4">
            <p className="text-white">
              {file ? (
                <span className="text-blue-400 font-medium italic">
                  Vald fil: {file.name}
                </span>
              ) : (
                "Release a .txt file here, or click to select"
              )}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation(); // Hindrar att "klicka på boxen" triggas när man klickar på knappen
              uploadFile();
            }}
            disabled={!file || uploading}
            className={`mt-6 px-4 py-3 rounded-md text-white font-semibold transition-all cursor-pointer ${
              uploading || !file
                ? "bg-zinc-700 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
          >
            {uploading ? "Uploading..." : "Upload now"}
          </button>
        </div>
      </div>
    </div>
  );
}
