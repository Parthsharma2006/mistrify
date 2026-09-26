import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const worker = await db.workerProfile.findUnique({
      where: { 
        id: (await params).id,
        verificationStatus: "VERIFIED"
      },
      include: {
        user: { select: { id: true, name: true, profilePhoto: true } },
        category: { select: { id: true, name: true } },
        skills: { include: { subcategory: true } },
        cooperative: { select: { id: true, name: true } },
        certificate: { select: { name: true, issuer: true, year: true } }, // Do not expose fileUrl to customer
        portfolio: true
      }
    });

    if (!worker) return NextResponse.json({ success: false, error: "Verified worker not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: worker });
  } catch (error) {
    console.error("Fetch worker profile error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch worker profile" }, { status: 500 });
  }
}