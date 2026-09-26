import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const categoryId = url.searchParams.get("categoryId");

    if (!categoryId) return NextResponse.json({ success: false, error: "Missing categoryId" }, { status: 400 });

    const questions = await db.testQuestion.findMany({
      where: { categoryId }
    });

    // Don't send correctOption to the client
    const safeQuestions = questions.map(q => ({
      id: q.id,
      question: q.question,
      options: JSON.parse(q.options)
    }));

    return NextResponse.json({ success: true, data: safeQuestions });
  } catch (error) {
    console.error("Fetch questions error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch questions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "WORKER") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { categoryId, answers } = await request.json(); // answers is { questionId: selectedIndex }

    const questions = await db.testQuestion.findMany({
      where: { categoryId }
    });

    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctOption) {
        score++;
      }
    });

    const passed = score >= Math.ceil(questions.length / 2); // 50% to pass

    const workerProfile = await db.workerProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (workerProfile) {
      await db.testAttempt.create({
        data: {
          workerId: workerProfile.id,
          categoryId,
          score,
          passed
        }
      });
    }

    return NextResponse.json({ success: true, data: { score, total: questions.length, passed } });
  } catch (error) {
    console.error("Submit test error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit test" }, { status: 500 });
  }
}
