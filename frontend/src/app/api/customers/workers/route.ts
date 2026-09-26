import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const categoryId = url.searchParams.get("categoryId");

    if (!categoryId) return NextResponse.json({ success: false, error: "Missing categoryId" }, { status: 400 });

    const workers = await db.workerProfile.findMany({
      where: {
        categoryId,
        verificationStatus: "VERIFIED" // CRITICAL PHASE 2 RULE
      },
      include: {
        user: { select: { id: true, name: true, profilePhoto: true } },
        skills: { include: { subcategory: true } },
        cooperative: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json({ success: true, data: workers });
  } catch (error) {
    console.error("Fetch verified workers error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch workers" }, { status: 500 });
  }
}