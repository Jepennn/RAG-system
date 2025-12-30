import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface Message {
  role: "user" | "ai";
  text: string;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [{ role: "ai", text: "What would you like to know?" }],
  isLoading: false,
  error: null,
};

export const sendMessage = createAsyncThunk<string, string>(
  "chat/sendMessage",
  async (text, { rejectWithValue }) => {
    try {
      const response = await fetch("http://localhost:8000", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
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

export const { addUserMessage } = chatSlice.actions;
export default chatSlice.reducer;
