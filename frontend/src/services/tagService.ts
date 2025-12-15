import { api } from "./api";
import type { Tag } from "../types";

export const tagService = {
  async getTags(search = "") {
    const response = await api.get<Tag[]>("/tags", { params: { search } });
    return response.data;
  },

  async createTag(data: { name: string; slug: string }) {
    const response = await api.post<Tag>("/tags", data);
    return response.data;
  },
};
