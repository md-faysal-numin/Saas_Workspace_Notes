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
    // console.log(user);
    return { user };
  },

  async register(data: RegisterData) {
    const response = await api.post<{ user: User; token: { token: string } }>(
      "/auth/register",
      data
    );
    const { user } = response.data;

    return { user };
  },

  async logout() {
    await api.post("/auth/logout");
  },

  async me() {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },

  async getUser(): Promise<User | null> {
    try {
      const response = await api.get<{ user: User }>("/auth/me");

      return response.data.user;
    } catch (error) {
      return null;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const res = await this.getUser();
    return res !== null;
  },
};
