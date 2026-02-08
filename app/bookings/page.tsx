import { Suspense } from "react";
import { BookingsClient } from "./BookingsClient";

export default function BookingsPage() {
    return (
        <Suspense fallback={
            <div className="container max-w-screen-xl mx-auto py-10 px-4 md:px-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Your Bookings</h1>
                        <p className="text-muted-foreground mt-1">
                            Loading...
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        }>
            <BookingsClient />
        </Suspense>
    );
}
