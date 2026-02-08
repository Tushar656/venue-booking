import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { courtId, startTime, endTime } = body;

        if (!courtId || !startTime || !endTime) {
            return NextResponse.json({ message: "Missing courtId, startTime, or endTime" }, { status: 400 });
        }

        const bookings = await prisma.booking.findMany({
            where: {
                courtId: courtId,
                status: {
                    not: "Cancelled"
                },
                // Overlap check: 
                startTime: {
                    lt: new Date(endTime),
                },
                endTime: {
                    gt: new Date(startTime),
                }
            },
            select: {
                startTime: true,
                endTime: true
            }
        });

        return NextResponse.json({ bookings }, { status: 200 });
    } catch (error) {
        console.error("Availability fetch error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
