import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { API_URL } from "../constants/api";

export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    divisionIndex: null,
    isLoading: false,
    isCheckingAuth: true,

    register: async (username, email, password) => {
        set({ isLoading: true });

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Something went wrong");

            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            await AsyncStorage.setItem("token", data.token);

            set({token: data.token, user: data.user, divisionIndex: data.user.divisionIndex, isLoading: false});

            return {success: true};
        } catch (error) {
            set({isLoading: false});
            return {success: false, error: error.message};
        }
    },

    login: async (email, password) => {
        set({ isLoading: true });

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password
                }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Something went wrong");

            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            await AsyncStorage.setItem("token", data.token);

            set({token: data.token, user: data.user, divisionIndex: data.user.divisionIndex, isLoading: false});

            return {success: true};
        } catch (error) {
            set({isLoading: false});
            return {success: false, error: error.message};
        }
    },

    checkAuth: async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const userJson = await AsyncStorage.getItem("user");
            const user = userJson ? JSON.parse(userJson) : null;

            console.log({token}, {user});

            set({token, user, divisionIndex: user.divisionIndex});
        } catch (error) {
            console.log("Auth check failed", error);
        } finally {
            set({ isCheckingAuth: false});
        }
    },

    logout: async () => {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        set({token: null, user: null});
    },

    setDivisionIndex: async (newIndex) => {
        set(state => {
            const updatedUser = state.user ? { ...state.user, divisionIndex: newIndex } : null;
            if (updatedUser) {
                AsyncStorage.setItem("user", JSON.stringify(updatedUser));
            }
            return { divisionIndex: newIndex, user: updatedUser };
        });
    },

}));