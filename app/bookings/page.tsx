"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BookingCard } from "@/components/ui/BookingCard";
import { TimeSlotSelector } from "@/components/ui/TimeSelector";
import { useAuth } from "@/context/AuthContext";

interface Booking {
    id: string;
    courtId: string;
    user: string;
    courtName: string;
    date: string;
    time: string;
    status: "Confirmed" | "Pending" | "Cancelled";
    amount: string;
}

interface Court {
    id: string;
    name: string;
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const searchParams = useSearchParams();
    const queryCourtId = searchParams.get("courtId");

    // Form state
    const [customerName, setCustomerName] = useState("");
    const [selectedCourtId, setSelectedCourtId] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [amount, setAmount] = useState("");

    // Filter state
    const [filterCourtId, setFilterCourtId] = useState("all");

    const { user } = useAuth();

    // Init filter from URL
    useEffect(() => {
        if (queryCourtId) {
            setFilterCourtId(queryCourtId);
            setSelectedCourtId(queryCourtId);
        }
    }, [queryCourtId]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch courts for dropdown
                const courtsRes = await fetch("/api/courts", { headers });
                if (courtsRes.ok) {
                    const courtsData = await courtsRes.json();
                    setCourts(courtsData.courts);
                    if (courtsData.courts.length > 0) {
                        setSelectedCourtId(courtsData.courts[0].id);
                    }
                }

                // Fetch bookings
                const bookingsRes = await fetch("/api/booking", { headers });
                if (bookingsRes.ok) {
                    const bookingsData = await bookingsRes.json();
                    const mappedBookings = bookingsData.bookings.map((b: any) => ({
                        id: b.id,
                        courtId: b.courtId,
                        user: b.customerName,
                        courtName: b.court.name,
                        date: new Date(b.startTime).toLocaleDateString(),
                        time: `${new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                        status: b.status || "Pending",
                        amount: b.amount ? String(b.amount) : "0"
                    }));
                    setBookings(mappedBookings);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const token = localStorage.getItem("token");
            const startDateTime = new Date(`${date}T${startTime}`);
            const endDateTime = new Date(`${date}T${endTime}`);

            const res = await fetch("/api/booking", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    courtId: selectedCourtId,
                    customerName,
                    startTime: startDateTime.toISOString(),
                    endTime: endDateTime.toISOString(),
                    amount
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to create booking");
            }

            const newBooking = data.booking;
            const mappedBooking: Booking = {
                id: newBooking.id,
                courtId: newBooking.courtId,
                user: newBooking.customerName,
                courtName: newBooking.court.name,
                date: new Date(newBooking.startTime).toLocaleDateString(),
                time: `${new Date(newBooking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(newBooking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                status: newBooking.status || "Pending",
                amount: newBooking.amount ? String(newBooking.amount) : "0"
            };

            setBookings([mappedBooking, ...bookings]);
            setIsCreating(false);
            resetForm();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const resetForm = () => {
        setCustomerName("");
        if (courts.length > 0) setSelectedCourtId(filterCourtId !== "all" ? filterCourtId : courts[0].id);
        setDate("");
        setStartTime("");
        setEndTime("");
        setAmount("");
    };

    const handleDelete = async (bookingId: string) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/booking?id=${bookingId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to delete booking");
            }

            setBookings(bookings.filter(b => b.id !== bookingId));
        } catch (err: any) {
            setError(err.message);
        }
    };

    const filteredBookings = filterCourtId === "all"
        ? bookings
        : bookings.filter(b => b.courtId === filterCourtId);

    return (
        <div className="container max-w-screen-xl mx-auto py-10 px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Bookings</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage reservations and schedules here.
                    </p>
                </div>
                {!isCreating && (
                    <Button onClick={() => setIsCreating(true)}>
                        Create Booking
                    </Button>
                )}
            </div>

            {!isCreating && (
                <div className="mb-6 flex items-center justify-between bg-muted/30 p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">Filter by Court:</span>
                        <select
                            className="bg-background border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-ring"
                            value={filterCourtId}
                            onChange={(e) => setFilterCourtId(e.target.value)}
                        >
                            <option value="all">All Courts</option>
                            {courts.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {isCreating && (
                <div className="mb-8 rounded-xl border bg-card text-card-foreground shadow-sm p-6 max-w-2xl animate-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col space-y-1.5 mb-6">
                        <h3 className="font-semibold leading-none tracking-tight text-lg">Create Booking</h3>
                        <p className="text-sm text-muted-foreground">Add a new manual reservation.</p>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Input
                                    id="customerName"
                                    placeholder="e.g. Alice Smith"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="relative">
                                    <select
                                        id="court"
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={selectedCourtId}
                                        onChange={(e) => setSelectedCourtId(e.target.value)}
                                        disabled={courts.length === 0}
                                    >
                                        {courts.length === 0 && <option value="">No courts available</option>}
                                        {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 max-w-sm">
                            <label htmlFor="date" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Date</label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none block mb-2">Select Time Slot</label>
                            <TimeSlotSelector
                                courtId={selectedCourtId}
                                date={date}
                                onTimeChange={(start, end) => {
                                    setStartTime(start);
                                    setEndTime(end);
                                }}
                            />
                            {/* Hidden inputs to maintain required validation if needed, or rely on state check in handleCreate */}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="amount" className="text-sm font-medium leading-none">Amount ($)</label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="100"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                            <Button type="submit">Confirm Booking</Button>
                        </div>
                    </form>
                </div>
            )}

            {bookings.length === 0 && !isCreating && filterCourtId === "all" ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-muted-foreground">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">No bookings yet</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                        There are no upcoming bookings scheduled. Create one to get started.
                    </p>
                    <Button onClick={() => setIsCreating(true)}>
                        Create Booking
                    </Button>
                </div>
            ) : (
                <>
                    {filteredBookings.length === 0 && !isCreating ? (
                        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center animate-in fade-in-50">
                            <p className="text-muted-foreground">No bookings found for the selected filter.</p>
                            <Button variant="ghost" onClick={() => setFilterCourtId("all")}>Clear Filter</Button>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredBookings.map((booking) => (
                                <BookingCard key={booking.id} booking={booking as any} onDelete={handleDelete} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
