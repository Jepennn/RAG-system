import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface Message {
  role: "user" | "ai";
  text: string;
}

interface SendMessagePayload {
  text: string;
  file_names: string[];
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  file_names: string[];
}

const initialState: ChatState = {
  messages: [{ role: "ai", text: "What would you like to know?" }],
  isLoading: false,
  error: null,
  file_names: [],
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const sendMessage = createAsyncThunk<string, SendMessagePayload>(
  "chat/sendMessage",
  async ({ text, file_names }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, file_names }),
      });
      if (!response.ok) throw new Error("Could not connect to server...");
      const data = await response.json();
      return data.reply;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({ role: "user", text: action.payload });
    },
    addFileName: (state, action: PayloadAction<string>) => {
      state.file_names.push(action.payload);
    },
    removeFileName: (state, action: PayloadAction<string>) => {
      state.file_names = state.file_names.filter((name) => name !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages.push({ role: "ai", text: action.payload });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.messages.push({
          role: "ai",
          text: "Could not connect to server...",
        });
        state.error = action.payload as string;
      });
  },
});

export const { addUserMessage, addFileName, removeFileName } = chatSlice.actions;
export default chatSlice.reducer;
