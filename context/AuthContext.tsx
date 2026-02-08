"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: () => { },
    logout: () => { },
    isAuthenticated: false,
    isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const initAuth = () => {
            const token = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

            if (token && storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    console.error("Failed to parse user data", error);
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        router.push("/home");
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        router.push("/login");
    };

    // Protected route logic
    useEffect(() => {
        if (isLoading) return;

        const publicRoutes = ["/", "/login", "/signup", "/about", "/contact"];
        const isPublicRoute = publicRoutes.includes(pathname);

        if (!user && !isPublicRoute) {
            // If try to access protected route without user, redirect to login
            router.push("/login");
        } else if (user && (pathname === "/login" || pathname === "/signup")) {
            // If user is logged in and tries to access login/signup, redirect to home
            router.push("/home");
        }
    }, [user, isLoading, pathname, router]);

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
