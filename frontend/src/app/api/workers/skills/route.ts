import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "WORKER") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { subcategoryIds } = await request.json();
    if (!Array.isArray(subcategoryIds)) {
      return NextResponse.json({ success: false, error: "Invalid data" }, { status: 400 });
    }

    const workerProfile = await db.workerProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!workerProfile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    // Delete existing skills
    await db.workerSkill.deleteMany({
      where: { workerId: workerProfile.id }
    });

    // Add new skills
    if (subcategoryIds.length > 0) {
      await db.workerSkill.createMany({
        data: subcategoryIds.map((id) => ({
          workerId: workerProfile.id,
          subcategoryId: id
        }))
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update skills error:", error);
    return NextResponse.json({ success: false, error: "Failed to update skills" }, { status: 500 });
  }
}

