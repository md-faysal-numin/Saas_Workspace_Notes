import { api } from "./api";
import type { User } from "../types";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

export const authService = {
  async login(data: LoginData) {
    const response = await api.post<{ user: User }>("/auth/login", data);
    const { user } = response.data;
    // localStorage.setItem('token', token.token)
    localStorage.setItem("user", JSON.stringify(user));
    return { user };
  },

  async register(data: RegisterData) {
    const response = await api.post<{ user: User; token: { token: string } }>(
      "/auth/register",
      data
    );
    const { user, token } = response.data;
    // localStorage.setItem('token', token.token)
    localStorage.setItem("user", JSON.stringify(user));
    return { user, token: token.token };
  },

  async logout() {
    await api.post("/auth/logout");
    // localStorage.removeItem('token')
    localStorage.removeItem("user");
  },

  async me() {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },

  getUser(): User | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("user");
  },
};
