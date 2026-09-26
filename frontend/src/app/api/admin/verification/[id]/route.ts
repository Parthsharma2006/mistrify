import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const worker = await db.workerProfile.findUnique({
      where: { id: (await params).id },
      include: {
        user: { select: { id: true, name: true, mobile: true, email: true, profilePhoto: true } },
        category: true,
        skills: { include: { subcategory: true } },
        certificate: true,
        portfolio: true,
        testAttempts: { orderBy: { createdAt: "desc" } }
      }
    });

    if (!worker) return NextResponse.json({ success: false, error: "Worker not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: worker });
  } catch (error) {
    console.error("Fetch worker error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch worker" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, status, reason, portfolioItemId } = body; 
    
    // action: "VERIFY_WORKER" | "VERIFY_PORTFOLIO"
    const isWorkerVerification = action === "VERIFY_WORKER" || !action;

    if (isWorkerVerification) {
      if (!["VERIFIED", "REJECTED"].includes(status)) {
        return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
      }

      const worker = await db.workerProfile.update({
        where: { id: (await params).id },
        data: {
          verificationStatus: status,
          rejectionReason: status === "REJECTED" ? reason : null
        }
      });
      return NextResponse.json({ success: true, data: worker });
    } else if (action === "VERIFY_PORTFOLIO") {
      if (!["APPROVED", "REJECTED"].includes(status)) {
        return NextResponse.json({ success: false, error: "Invalid portfolio status" }, { status: 400 });
      }

      const portfolioItem = await db.portfolioItem.update({
        where: { id: portfolioItemId },
        data: {
          status: status
        }
      });
      return NextResponse.json({ success: true, data: portfolioItem });
    }
    
    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json({ success: false, error: "Failed to update status" }, { status: 500 });
  }
}