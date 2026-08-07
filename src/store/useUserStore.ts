import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  logisticId?: string;
  branch: string;
  branchName?: string;
  bookingBranch: string;
  bookingBranchName?: string;
  ewbApiAccess?: boolean;
  logisticName?: string;
  permissions?: any;
}

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
