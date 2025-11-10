import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {jwtDecode} from "jwt-decode";

interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
}

interface AuthState {
  token: string | null;
  role: "Candidate" | "HR" | null;
  userId: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  role: null,
  userId: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      if (action.payload) {
        const decoded = jwtDecode<JwtPayload>(action.payload);
        state.role = decoded.role as AuthState["role"];
        state.userId = decoded.sub;
        localStorage.setItem("token", action.payload);
      } else {
        state.role = null;
        state.userId = null;
        localStorage.removeItem("token");
      }
    },
    logout(state) {
      state.token = null;
      state.role = null;
      state.userId = null;
      localStorage.removeItem("token");
    },
  },
});

export const { setToken, logout } = authSlice.actions;
export default authSlice.reducer;
