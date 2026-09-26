import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const pendingWorkers = await db.workerProfile.findMany({
      where: {
        verificationStatus: "PENDING",
      },
      include: {
        user: { select: { id: true, name: true, mobile: true } },
        category: { select: { id: true, name: true } },
        certificate: true,
        testAttempts: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, data: pendingWorkers });
  } catch (error) {
    console.error("Fetch pending workers error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch pending workers" }, { status: 500 });
  }
}