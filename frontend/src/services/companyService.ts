// import { api } from './api'
// import type { Company } from '../types'

// export const companyService = {
//   async register(data: { name: string; slug: string }) {
//     const response = await api.post<Company>('/company', data)
//     return response.data
//   },
// }

import { api } from "./api";

interface CompanyRegistrationData {
  companyName: string;
  companySlug: string;
  fullName: string;
  email: string;
  password: string;
}

interface CompanyRegistrationResponse {
  message: string;
  company: {
    name: string;
    slug: string;
  };
  user: {
    id: number;
    email: string;
    fullName: string;
    role: string;
  };
}

export const companyService = {
  async registerCompanyWithAdmin(data: CompanyRegistrationData) {
    const response = await api.post<CompanyRegistrationResponse>(
      "/company/register",
      data
    );
    return response.data;
  },
};
