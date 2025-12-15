import { api } from "./api";
import type { Workspace, Note, PaginatedResponse } from "../types";

export const workspaceService = {
  async getWorkspaces(page = 1) {
    const response = await api.get<PaginatedResponse<Workspace>>(
      "/workspaces",
      {
        params: { page, limit: 50 },
      }
    );
    return response.data;
  },

  async getWorkspace(id: number, page = 1) {
    const response = await api.get<{
      workspace: Workspace;
      notes: PaginatedResponse<Note>;
    }>(`/workspaces/${id}`, {
      params: { page, limit: 20 },
    });
    return response.data;
  },

  async createWorkspace(data: {
    name: string;
    slug: string;
    description?: string;
  }) {
    const response = await api.post<Workspace>("/workspaces", data);
    return response.data;
  },

  async updateWorkspace(
    id: number,
    data: { name?: string; slug?: string; description?: string }
  ) {
    const response = await api.put<Workspace>(`/workspaces/${id}`, data);
    return response.data;
  },

  async deleteWorkspace(id: number) {
    await api.delete(`/workspaces/${id}`);
  },
};
