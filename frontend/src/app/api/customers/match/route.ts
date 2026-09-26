import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { findMatchingWorkers } from "@/lib/matching";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { categoryId, subcategoryId, latitude, longitude, isEmergency } = await request.json();

    if (!categoryId || !subcategoryId || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ success: false, error: "Missing required matching parameters" }, { status: 400 });
    }

    const matchedWorkers = await findMatchingWorkers(categoryId, subcategoryId, latitude, longitude, !!isEmergency);

    return NextResponse.json({ success: true, data: matchedWorkers, isEmergency });
  } catch (error) {
    console.error("Match error:", error);
    return NextResponse.json({ success: false, error: "Failed to find matching workers" }, { status: 500 });
  }
}
