"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Login failed");
            }

            login(data.token, data.user);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container relative flex-col items-center display-flex justify-center md:grid lg:max-w-none mx-auto py-10 lg:py-0 min-h-[500px]">
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email to sign in to your account
                        </p>
                    </div>
                    <div className="grid gap-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-2">
                                <div className="grid gap-1">
                                    <Input
                                        id="email"
                                        placeholder="name@example.com"
                                        type="email"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        autoCorrect="off"
                                        className="mb-2"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <Input
                                        id="password"
                                        placeholder="Password"
                                        type="password"
                                        autoCapitalize="none"
                                        autoComplete="current-password"
                                        autoCorrect="off"
                                        className="mb-2"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                {error && <p className="text-sm text-red-500">{error}</p>}
                                <Button disabled={isLoading}>
                                    {isLoading ? "Signing in..." : "Sign In"}
                                </Button>
                            </div>
                        </form>
                    </div>

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/signup"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
