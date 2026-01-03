import { addUserMessage, sendMessage } from "@/lib/slices/chatSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { removeFileName } from "@/lib/slices/chatSlice";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FileText, Loader2, X, File } from "lucide-react";
import { toast } from "sonner";

export function Chatbox() {
  const dispatch = useDispatch<AppDispatch>();

  const { isLoading } = useSelector((state: RootState) => state.chat);
  const { file_names } = useSelector((state: RootState) => state.chat);
  const [inputValue, setInputValue] = useState("");

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const textToSend = inputValue;
    dispatch(addUserMessage(textToSend));
    setInputValue("");
    dispatch(sendMessage({ text: textToSend, file_names }));
  };

  // Remove file from context
  async function handleRemoveFile(file: string) {
    try {
      dispatch(removeFileName(file));
    } catch (error) {
      toast.error("Failed removing file from context");
    }
  }

  return (
    <div className="p-4 pb-8 bg-zinc-900">
      <div className="max-w-2xl w-full mx-auto flex flex-col gap-3">
        {file_names.length <= 0 && (
          <div className="flex flex-wrap gap-2 px-1">
            <div className="flex items-center gap-2 bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 rounded-lg px-3.5 py-1.5 text-xs hover:bg-zinc-800 transition-colors group">
              <File size={14} className="text-zinc-500" />
              <span className="truncate max-w-[150px]">All files</span>
            </div>
          </div>
        )}

        {file_names.length > 0 && (
          <div className="flex flex-wrap gap-2 px-1">
            {file_names.map((file) => (
              <div
                key={file}
                className="flex items-center gap-2 bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 rounded-lg px-2.5 py-1.5 text-xs hover:bg-zinc-800 transition-colors group"
              >
                <File size={14} className="text-zinc-500" />
                <span className="truncate max-w-[150px]">{file}</span>
                <button
                  onClick={() => handleRemoveFile(file)}
                  className="ml-1 p-0.5 rounded-md hover:bg-zinc-700 text-zinc-500 hover:text-red-400 transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-center bg-zinc-950 border border-white/10 p-1.5 pl-4 rounded-full focus-within:border-white/20 transition-all shadow-xl">
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
            className="bg-zinc-100 text-black h-8 w-8 flex items-center justify-center rounded-full hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="text-xl font-bold">↑</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
