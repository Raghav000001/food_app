import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_BASE_URL } from "../store/constants";
import type { AppContextType, User } from "../types";

const api = axios.create({
    baseURL: BACKEND_BASE_URL,
});

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

    const fetchUser = useCallback(async () => {
        if (!isLoaded) return;
        
        if (!isSignedIn) {
            setUser(null);
            setIsUserAuthenticated(false);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const token = await getToken();
            
            const response = await api.get("/auth/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setUser(response.data.data);
                setIsUserAuthenticated(true);
            }
        } catch (error) {
            console.error("Failed to fetch user from backend:", error);
            setUser(null);
            setIsUserAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, [getToken, isLoaded, isSignedIn]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return (
        <AppContext.Provider 
            value={{
                isUserAuthenticated,
                loading,
                setIsUserAuthenticated,
                setLoading,
                setUser,
                user
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppData = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppData must be used within AppProvider");
    }
    return context;
};

   