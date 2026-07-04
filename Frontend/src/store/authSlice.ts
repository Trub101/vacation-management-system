import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthResponse, User } from "../types/user.types";
import { setToken, clearToken } from "../api/client";

const USER_KEY = "vacations_user";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

const initialUser = loadUser();

const initialState: AuthState = {
  user: initialUser,
  isAuthenticated: Boolean(initialUser && localStorage.getItem("vacations_token")),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<AuthResponse>) {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      setToken(action.payload.token);
      localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user));
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      clearToken();
      localStorage.removeItem(USER_KEY);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
