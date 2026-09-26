import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "WORKER") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { name, number, issuer, year, fileUrl } = data;

    const workerProfile = await db.workerProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!workerProfile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    const certificate = await db.certificate.upsert({
      where: { workerId: workerProfile.id },
      update: { name, number, issuer, year, fileUrl },
      create: {
        workerId: workerProfile.id,
        name, number, issuer, year, fileUrl
      }
    });

    return NextResponse.json({ success: true, data: certificate });
  } catch (error) {
    console.error("Certificate error:", error);
    return NextResponse.json({ success: false, error: "Failed to upload certificate" }, { status: 500 });
  }
}
