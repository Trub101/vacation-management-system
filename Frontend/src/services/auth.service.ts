import { api } from "../api/client";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "../types/user.types";

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function checkEmailAvailable(email: string): Promise<boolean> {
  const { data } = await api.get<{ available: boolean }>("/auth/check-email", {
    params: { email },
  });
  return data.available;
}
