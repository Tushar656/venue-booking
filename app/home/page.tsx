"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CourtCard } from "@/components/ui/CourtCard";
import { useAuth } from "@/context/AuthContext";

interface Court {
    id: string;
    name: string;
    type: string;
    pricePerHour: string;
    surface: string;
}

const SPORT_TYPES = ["Cricket", "Badminton", "Tennis", "Football", "Squash", "Basketball"];
const SURFACE_TYPES = ["Synthetic", "Wood", "Grass", "Clay", "Hard Court", "Turf", "Carpet"];

export default function DashboardPage() {
    const [courts, setCourts] = useState<Court[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // Form state
    const [name, setName] = useState("");
    const [type, setType] = useState(SPORT_TYPES[0]);
    const [price, setPrice] = useState("");
    const [surface, setSurface] = useState(SURFACE_TYPES[0]);

    const { user } = useAuth();

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editCourtId, setEditCourtId] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourts = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("/api/courts", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setCourts(data.courts);
                }
            } catch (error) {
                console.error("Failed to fetch courts", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchCourts();
        }
    }, [user]);

    const resetForm = () => {
        setName("");
        setType(SPORT_TYPES[0]);
        setPrice("");
        setSurface(SURFACE_TYPES[0]);
    };

    const handleCancel = () => {
        setIsCreating(false);
        setIsEditing(false);
        setEditCourtId(null);
        resetForm();
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const token = localStorage.getItem("token");
            const method = isEditing ? "PUT" : "POST";
            const body = {
                id: isEditing ? editCourtId : undefined,
                name,
                type,
                pricePerHour: price,
                surface
            };

            const res = await fetch("/api/courts", {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to save court");
            }

            if (isEditing) {
                setCourts(courts.map(c => c.id === editCourtId ? data.court : c));
            } else {
                setCourts([data.court, ...courts]);
            }

            handleCancel();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEditClick = (court: Court) => {
        setIsEditing(true);
        setIsCreating(true);
        setEditCourtId(court.id);
        setName(court.name);
        setType(court.type);
        setPrice(court.pricePerHour);
        setSurface(court.surface);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDeleteClick = async (courtId: string) => {
        if (!confirm("Are you sure you want to delete this court?")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/courts?id=${courtId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.ok) {
                setCourts(courts.filter(c => c.id !== courtId));
            } else {
                const data = await res.json();
                alert(data.message || "Failed to delete court");
            }
        } catch (error) {
            console.error("Failed to delete court", error);
        }
    };

    return (
        <div className="container max-w-screen-xl mx-auto py-10 px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Courts</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your sports courts availability and details.
                    </p>
                </div>
                {!isCreating && (
                    <Button onClick={() => setIsCreating(true)}>
                        Add New Court
                    </Button>
                )}
            </div>

            {isCreating && (
                <div className="mb-8 rounded-xl border bg-card text-card-foreground shadow-sm p-6 max-w-2xl animate-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col space-y-1.5 mb-6">
                        <h3 className="font-semibold leading-none tracking-tight text-lg">{isEditing ? "Edit Court" : "Create Court"}</h3>
                        <p className="text-sm text-muted-foreground">{isEditing ? "Update existing court details." : "Add a new sports court details below."}</p>
                        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Input
                                id="name"
                                placeholder="e.g. Center Court, Pitch 1"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <div className="relative">
                                    <select
                                        id="type"
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                    >
                                        {SPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <select
                                        id="surface"
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={surface}
                                        onChange={(e) => setSurface(e.target.value)}
                                    >
                                        {SURFACE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Input
                                    id="price"
                                    type="number"
                                    placeholder="50"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={handleCancel}>Cancel</Button>
                            <Button type="submit">{isEditing ? "Update Court" : "Create Court"}</Button>
                        </div>
                    </form>
                </div>
            )}

            {courts.length === 0 && !isCreating ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-muted-foreground">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">No courts added</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                        You haven&apos;t created any courts yet. Add your first court to start accepting bookings.
                    </p>
                    <Button onClick={() => setIsCreating(true)}>
                        Add Court
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {courts.map((court) => (
                        <CourtCard
                            key={court.id}
                            court={court as any}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
