import { create } from "zustand";

import type User from "../types/User";

interface AuthState {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  User: User | null;
  setUser: (user: User) => void;
  login: (user: User) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  User: null,
  setUser: (user: User) => set({ User: user }),
  login: (user: User) => set({ User: user, isAuthenticated: true }),
  logout: () => set({ User: null, isAuthenticated: false }),
}));

export default useAuthStore;
