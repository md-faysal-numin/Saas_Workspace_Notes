import { api } from "./api";
import type { Note, NoteHistory, PaginatedResponse } from "../types";

interface CreateNoteData {
  workspaceId: number;
  title: string;
  content: string;
  type: "public" | "private";
  status: "draft" | "published";
  tagIds?: number[];
}

export const noteService = {
  async getPublicNotes(
    page = 1,
    search = "",
    status = "all",
    workspaceId?: number
  ) {
    const response = await api.get<PaginatedResponse<Note>>("/notes/public", {
      params: {
        page,
        search,
        status: status === "all" ? undefined : status,
        workspaceId,
        limit: 20,
      },
    });
    return response.data;
  },

  async getPrivateNotes(
    page = 1,
    search = "",
    status = "all",
    workspaceId?: number
  ) {
    const response = await api.get<PaginatedResponse<Note>>("/notes/private", {
      params: {
        page,
        search,
        status: status === "all" ? undefined : status,
        workspaceId,
        limit: 20,
      },
    });
    return response.data;
  },

  async getNote(id: number) {
    const response = await api.get<Note>(`/notes/${id}`);
    return response.data;
  },

  async createNote(data: CreateNoteData) {
    const response = await api.post<Note>("/notes", data);
    return response.data;
  },

  async updateNote(id: number, data: Partial<CreateNoteData>) {
    const response = await api.put<Note>(`/notes/${id}`, data);
    return response.data;
  },

  async deleteNote(id: number) {
    await api.delete(`/notes/${id}`);
  },

  async getHistories(id: number) {
    const response = await api.get<NoteHistory[]>(`/notes/${id}/histories`);
    return response.data;
  },

  async restoreFromHistory(noteId: number, historyId: number) {
    const response = await api.post<Note>(`/notes/${noteId}/restore`, {
      historyId,
    });
    return response.data;
  },

  async vote(noteId: number, voteType: "upvote" | "downvote") {
    const response = await api.post<Note>(`/notes/${noteId}/vote`, {
      voteType,
    });
    return response.data;
  },
};
