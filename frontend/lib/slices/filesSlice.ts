import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface FilesState {
  items: string[];
  loading: boolean;
  error: string | null;
}

const initialState: FilesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchFiles = createAsyncThunk("files/fetchFiles", async () => {
  const response = await fetch("http://localhost:8000/files");
  const data = await response.json();
  return data.files || [];
});

export const deleteFile = createAsyncThunk(
  "files/deleteFile",
  async (fileName: string) => {
    const response = await fetch(`http://localhost:8000/files/${fileName}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed deleting file");
    return fileName; // Vi returnerar filnamnet så vi kan ta bort det från state
  }
);

export const deleteAllFiles = createAsyncThunk(
  "files/deleteAllFiles",
  async () => {
    const response = await fetch("http://localhost:8000/files", {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed deleting all files");
    return await response.json();
  }
);

const filesSlice = createSlice({
  name: "files",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Files
      .addCase(fetchFiles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFiles.rejected, (state) => {
        state.loading = false;
      })
      .addCase(deleteAllFiles.fulfilled, (state) => {
        state.items = [];
        state.loading = false;
      })
      // Delete File
      .addCase(deleteFile.fulfilled, (state, action) => {
        // Här uppdaterar vi state direkt utan att ladda om sidan!
        state.items = state.items.filter((file) => file !== action.payload);
      });
  },
});

export default filesSlice.reducer;
