// lib/store.ts
import { configureStore } from "@reduxjs/toolkit";
import filesReducer from "./slices/filesSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      files: filesReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export default makeStore;
