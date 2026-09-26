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

    const { title, description, fileUrl, fileType } = await request.json();

    const workerProfile = await db.workerProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!workerProfile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    const portfolioItem = await db.portfolioItem.create({
      data: {
        workerId: workerProfile.id,
        title,
        description,
        fileUrl,
        fileType
      }
    });

    return NextResponse.json({ success: true, data: portfolioItem });
  } catch (error) {
    console.error("Add portfolio error:", error);
    return NextResponse.json({ success: false, error: "Failed to add portfolio item" }, { status: 500 });
  }
}

