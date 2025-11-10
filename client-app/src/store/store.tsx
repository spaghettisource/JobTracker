import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../modules/auth/authSlice";
import applicationsReducer from "../modules/applications/applicationsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    applications: applicationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
