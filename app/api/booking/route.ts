
import { NextResponse } from 'next/server';
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;

const getAuthenticatedUser = async (req: Request) => {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string };
        return decoded.userId;
    } catch (error) {
        return null;
    }
}

export async function POST(req: Request) {
    try {
        const userId = await getAuthenticatedUser(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { courtId, startTime, endTime, customerName, amount } = await req.json();

        if (!courtId || !startTime || !endTime || !customerName) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // fetch court
        const court = await prisma.court.findUnique({
            where: {
                id: courtId,
            },
        });

        if (!court) {
            return NextResponse.json({ message: "Court not found" }, { status: 404 });
        }

        // Check if court belongs to user (for manual booking by owner)
        if (court.userId !== userId) {
            return NextResponse.json({ message: "Unauthorized. You can only book courts you own." }, { status: 401 });
        }

        // Check availability
        const existingBooking = await prisma.booking.findFirst({
            where: {
                courtId,
                OR: [
                    {
                        startTime: {
                            lt: new Date(endTime),
                        },
                        endTime: {
                            gt: new Date(startTime),
                        },
                    },
                ],
            },
        });

        if (existingBooking) {
            return NextResponse.json({ message: "Time conflict" }, { status: 409 });
        }

        const booking = await prisma.booking.create({
            data: {
                courtId,
                userId, // Owner as user for manual booking
                customerName,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                amount: amount ? Number(amount) : 0, // Store as number if Decimal?
            },
            include: {
                court: true
            }
        });

        return NextResponse.json({ message: "Booking created successfully", booking }, { status: 201 });
    } catch (error) {
        console.error("Booking error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const userId = await getAuthenticatedUser(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const bookings = await prisma.booking.findMany({
            where: {
                userId,
            },
            include: {
                court: true, // Include court details to show name
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ bookings }, { status: 200 });
    } catch (error) {
        console.error("Get bookings error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}


export async function DELETE(req: Request) {
    try {
        const userId = await getAuthenticatedUser(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ message: "Booking ID is required" }, { status: 400 });
        }

        // Verify booking ownership
        const existingBooking = await prisma.booking.findUnique({
            where: { id },
        });

        if (!existingBooking) {
            return NextResponse.json({ message: "Booking not found" }, { status: 404 });
        }

        if (existingBooking.userId !== userId) {
            return NextResponse.json({ message: "You are not authorized to delete this booking" }, { status: 403 });
        }

        await prisma.booking.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Booking cancelled successfully" }, { status: 200 });
    } catch (error) {
        console.error("Delete booking error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
