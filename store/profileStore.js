import { create } from 'zustand';
import { API_URL } from "../constants/api";
import { useAuthStore } from './authStore';

export const useProfileStore = create((set, get) => ({
  CKYC: false,
  BasicDetails: false,
  Address: false,
  AccountDetails: false,
  NomineeDetails: false,
  NomineeAuthenticated: false,
  isMinor: false,

  setProfileStatus: (data) =>
    set({
      CKYC: Boolean(data.CKYC),
      BasicDetails: Boolean(data.BasicDetails),
      Address: Boolean(data.Address),
      AccountDetails: Boolean(data.AccountDetails),
      NomineeDetails: Boolean(data.NomineeDetails),
      NomineeAuthenticated: Boolean(data.NomineeAuthenticated),
      isMinor: Boolean(data.isMinor),
    }),

  fetchProfileStatus: async () => {
    try {
      const token = useAuthStore.getState().token;

      const res = await fetch(`${API_URL}/v1/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        get().setProfileStatus(data);
      }
    } catch (error) {
      console.error("Error fetching profile status:", error);
    }
  },
}));
