import { configureStore } from "@reduxjs/toolkit";
import filesReducer from "./slices/filesSlice";
import chatReducer from "./slices/chatSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      files: filesReducer,
      chat: chatReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export default makeStore;
