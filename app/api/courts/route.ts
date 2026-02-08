import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;

// Helper to authenticate user
async function getAuthenticatedUser(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
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

        const { name, type, pricePerHour, surface } = await req.json();

        if (!name || !type || !pricePerHour) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const existingCourt = await prisma.court.findFirst({
            where: {
                name,
                userId,
            },
        });

        if (existingCourt) {
            return NextResponse.json({ message: "Court with this name already exists in your venue." }, { status: 409 });
        }

        const court = await prisma.court.create({
            data: {
                name,
                type,
                pricePerHour: String(pricePerHour),
                surface: surface || "Synthetic",
                userId,
            },
        });

        return NextResponse.json({ message: "Court created successfully", court }, { status: 201 });

    } catch (error) {
        console.error("Create court error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const userId = await getAuthenticatedUser(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const courts = await prisma.court.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ courts }, { status: 200 });
    } catch (error) {
        console.error("Get courts error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const userId = await getAuthenticatedUser(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id, name, type, pricePerHour, surface } = await req.json();

        if (!id) {
            return NextResponse.json({ message: "Court ID is required" }, { status: 400 });
        }

        const existingCourt = await prisma.court.findUnique({
            where: { id },
        });

        if (!existingCourt || existingCourt.userId !== userId) {
            return NextResponse.json({ message: "Court not found or unauthorized" }, { status: 404 });
        }

        const updatedCourt = await prisma.court.update({
            where: { id },
            data: {
                name,
                type,
                pricePerHour: String(pricePerHour),
                surface,
            },
        });

        return NextResponse.json({ message: "Court updated successfully", court: updatedCourt }, { status: 200 });
    } catch (error) {
        console.error("Update court error:", error);
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
            return NextResponse.json({ message: "Court ID is required" }, { status: 400 });
        }

        const existingCourt = await prisma.court.findUnique({
            where: { id },
        });

        if (!existingCourt || existingCourt.userId !== userId) {
            return NextResponse.json({ message: "Court not found or unauthorized" }, { status: 404 });
        }

        await prisma.court.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Court deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Delete court error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
