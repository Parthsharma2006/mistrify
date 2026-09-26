
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false });
  const worker = await db.workerProfile.findUnique({ where: { userId: session.user.id } });
  if (!worker || !worker.categoryId) return NextResponse.json({ success: false });
  
  const questions = await db.testQuestion.findMany({ where: { categoryId: worker.categoryId } });
  return NextResponse.json({
    success: true,
    data: questions.map(q => ({ id: q.id, question: q.question, options: JSON.parse(q.options) }))
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false });
  const worker = await db.workerProfile.findUnique({ where: { userId: session.user.id } });
  if (!worker || !worker.categoryId) return NextResponse.json({ success: false });

  const { answers } = await req.json();
  
  const questions = await db.testQuestion.findMany({ where: { categoryId: worker.categoryId } });
  let score = 0;
  questions.forEach(q => { if (answers[q.id] === q.correctOption) score++; });
  
  const passed = score >= Math.ceil(questions.length / 2);
  await db.testAttempt.create({ data: { workerId: worker.id, categoryId: worker.categoryId, score, passed } });
  
  if (passed) {
    await db.workerProfile.update({ where: { id: worker.id }, data: { verificationStatus: 'VERIFIED' } });
  }
  
  return NextResponse.json({ success: true, data: { score, total: questions.length, passed } });
}
