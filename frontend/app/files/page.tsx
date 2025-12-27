"use client";

import { useState } from "react";

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
      alert("Välj en fil först!");
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
        setMessage(`Success: ${data.filename} är uppladdad!`);
      } else {
        setMessage("Något gick fel vid uppladdningen.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Kunde inte ansluta till servern.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Upload documents to the bot</h1>

      <div className="border-2 border-dashed border-gray-300 p-10 rounded-lg text-center">
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
          className={`mt-6 px-6 py-2 rounded-md text-white font-medium ${
            uploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uploading ? "Laddar upp..." : "Starta bearbetning"}
        </button>
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
