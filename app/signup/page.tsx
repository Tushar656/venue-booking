"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
    const { login } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Registration failed");
            }

            const loginRes = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const loginData = await loginRes.json();

            if (loginRes.ok) {
                login(loginData.token, loginData.user);
            } else {
                window.location.href = "/login";
            }

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
                            Create an account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email below to create your account
                        </p>
                    </div>
                    <div className="grid gap-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-2">
                                <div className="grid gap-1">
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        type="text"
                                        autoCapitalize="none"
                                        autoComplete="name"
                                        autoCorrect="off"
                                        className="mb-2"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
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
                                        autoComplete="new-password"
                                        autoCorrect="off"
                                        className="mb-2"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                {error && <p className="text-sm text-red-500">{error}</p>}
                                <Button disabled={isLoading}>
                                    {isLoading ? "Creating account..." : "Sign Up with Email"}
                                </Button>
                            </div>
                        </form>

                    </div>
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{" "}
                        <Link
                            href="/terms"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
