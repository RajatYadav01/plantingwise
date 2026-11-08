import { api } from "@/lib/api";

/** Authentication operations used by the auth screens and garden session provider. */
export const authService = {
	getCurrentUser: () => api.me(),
	login: (email: string, password: string) => api.login(email, password),
	register: (name: string, email: string, password: string) => api.register(name, email, password),
	logout: () => api.logout(),
};
