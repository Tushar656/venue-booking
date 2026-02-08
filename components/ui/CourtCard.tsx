"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";

export interface CourtProps {
    id: string;
    name: string;
    type: string;
    pricePerHour: string;
    surface: string;
}

interface CourtCardProps {
    court: CourtProps;
    onEdit?: (court: CourtProps) => void;
    onDelete?: (courtId: string) => void;
}

export function CourtCard({ court, onEdit, onDelete }: CourtCardProps) {
    const router = useRouter();
    return (
        <div className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/20">
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                                {court.type}
                            </span>
                        </div>
                        <h3 className="font-semibold tracking-tight text-xl pt-1">
                            {court.name}
                        </h3>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                            <button
                                onClick={() => onEdit(court)}
                                className="text-muted-foreground hover:text-primary transition-colors p-1"
                                aria-label="Edit court"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(court.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                aria-label="Delete court"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                        <span>Surface</span>
                        <span className="font-medium text-foreground">{court.surface}</span>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <div>
                        <span className="text-2xl font-bold">${court.pricePerHour}</span>
                        <span className="text-sm text-muted-foreground ml-1">/ hour</span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className=""
                        onClick={() => router.push(`/bookings?courtId=${court.id}`)}
                    >
                        Bookings
                    </Button>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-primary/0 group-hover:bg-primary/10 transition-colors"></div>
        </div>
    );
}
