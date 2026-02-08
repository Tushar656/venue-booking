"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "../ui/Button";

export function Navbar() {
    const { user, logout } = useAuth();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 w-full max-w-screen-xl items-center justify-between px-4 md:px-6 mx-auto">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="font-bold text-xl inline-block">VenueBook</span>
                    </Link>
                </div>

                {!user && (
                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" size="sm">
                                Log in
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button size="sm">
                                Sign up
                            </Button>
                        </Link>
                    </div>
                )}
                {user && (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 mr-2">
                            <span className="text-sm font-medium hidden md:inline-block">
                                {user.name}
                            </span>
                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-700">
                                {user.name ? user.name[0].toUpperCase() : "U"}
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={logout}>
                            Log out
                        </Button>
                    </div>
                )}
            </div>
        </header>
    );
}
