import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  branch: string;
  bookingBranch: string;
  ewbApiAccess?: boolean;
}

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
