"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleArrowLeft } from "lucide-react";

export default function FilesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      alert("Select a file!");
      return;
    }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Success: ${data.filename} uploaded!`);
      } else {
        setMessage("Something went wrong...");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Could not connect to the server...");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white font-sans antialiased">
      {/* --- HEADER --- */}
      <div className="relative flex justify-center items-center p-4 bg-zinc-950 backdrop-blur-md sticky top-0 z-10 border-b border-white/10">
        <h2 className="font-semibold text-lg tracking-thickest text-white uppercase">
          Upload documents
        </h2>

        <Link
          href="/"
          className="absolute left-6 flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors group"
        >
          <CircleArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span>Chat</span>
        </Link>
      </div>

      <div className="flex justify-center mt-10">
        <div className="max-w-200 border-2 border-solid border-gray-300 p-10 rounded-lg text-center">
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />

          <p className="mt-2 text-gray-400">
            {file
              ? `Select file: ${file.name}`
              : "No file selected (only .txt for now)"}
          </p>

          <button
            onClick={uploadFile}
            disabled={!file || uploading}
            className={`mt-6 px-6 py-2 rounded-md text-white font-medium cursor-pointer ${
              uploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      {message && (
        <p
          className={`mt-4 p-3 rounded ${
            message.includes("Success")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
