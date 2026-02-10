import { create } from "zustand";

import type User from "../types/User";

interface AuthState {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  User: User | null;
  setUser: (user: User) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  User: null,
  setUser: (user: User) => set({ User: user }),
}));

export default useAuthStore;
