
import { Button } from "../ui/Button";

export interface BookingProps {
    id: string;
    user: string;
    courtName: string;
    date: string;
    time: string;
    amount: string;
}

interface BookingCardProps {
    booking: BookingProps;
    onDelete?: (bookingId: string) => void;
}

export function BookingCard({ booking, onDelete }: BookingCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/20">
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h3 className="font-semibold tracking-tight text-xl">
                            {booking.user}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {booking.courtName}
                        </p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                            aria-label="Cancel booking"
                            onClick={() => onDelete?.(booking.id)}
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
                    </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                        <span>Date</span>
                        <span className="font-medium text-foreground">{booking.date}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                        <span>Time</span>
                        <span className="font-medium text-foreground">{booking.time}</span>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <div>
                        <span className="text-2xl font-bold">${booking.amount}</span>
                        <span className="text-sm text-muted-foreground ml-1">Total</span>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-primary/0 group-hover:bg-primary/10 transition-colors"></div>
        </div>
    );
}
