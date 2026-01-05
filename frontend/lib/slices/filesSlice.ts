import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface FilesState {
  items: string[];
  loading: boolean;
  error: string | null;
  uploading: boolean;
}

const initialState: FilesState = {
  items: [],
  loading: false,
  error: null,
  uploading: false,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

//Thunk to fetchfiles
export const fetchFiles = createAsyncThunk("files/fetchFiles", async () => {
  const response = await fetch(`${API_URL}/files`);
  const data = await response.json();
  return data.files || [];
});

//Thunk to delete a specfic file
export const deleteFile = createAsyncThunk(
  "files/deleteFile",
  async (fileName: string) => {
    const response = await fetch(`${API_URL}/files/${fileName}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed deleting file");
    return fileName; // Vi returnerar filnamnet så vi kan ta bort det från state
  }
);

//Thunk to delete al files
export const deleteAllFiles = createAsyncThunk(
  "files/deleteAllFiles",
  async () => {
    const response = await fetch(`${API_URL}/files`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed deleting all files");
    return await response.json();
  }
);

const filesSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    addFile: (state, action: PayloadAction<string>) => {
      state.items.push(action.payload);
    },
  },
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

export const { addFile } = filesSlice.actions;
export default filesSlice.reducer;
