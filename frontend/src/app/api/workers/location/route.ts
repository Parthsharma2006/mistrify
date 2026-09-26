import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "WORKER") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { latitude, longitude } = await request.json();

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ success: false, error: "Missing coordinates" }, { status: 400 });
    }

    const worker = await db.workerProfile.update({
      where: { userId: session.user.id },
      data: { latitude, longitude }
    });

    return NextResponse.json({ success: true, data: { latitude: worker.latitude, longitude: worker.longitude } });
  } catch (error) {
    console.error("Update location error:", error);
    return NextResponse.json({ success: false, error: "Failed to update location" }, { status: 500 });
  }
}
