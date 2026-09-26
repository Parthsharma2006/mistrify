"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, CheckCircle, XCircle } from "lucide-react";

export default function AssessmentPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  const router = useRouter();

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number, total: number, passed: boolean } | null>(null);

  useEffect(() => {
    if (!categoryId) return;
    fetch('/api/tests/worker')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setQuestions(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, [categoryId]);

  const handleSelect = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(s => s + 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/tests/worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit test");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>;

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">No Assessment Available</h2>
        <p className="text-gray-400 mb-8">There are currently no mock questions available for this category.</p>
        <button onClick={() => router.back()} className="px-6 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors">Go Back</button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-8">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-8 rounded-3xl glass-panel">
          {result.passed ? (
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
          ) : (
            <XCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          )}
          <h2 className={`text-3xl font-bold mb-2 ${result.passed ? "text-green-400" : "text-red-400"}`}>
            {result.passed ? "Assessment Passed!" : "Assessment Failed"}
          </h2>
          <p className="text-xl text-white font-medium mb-6">You scored {result.score} out of {result.total}</p>
          
          {result.passed ? (
            <p className="text-gray-400 mb-8">Congratulations! Your skill has been recorded. Your profile is now pending admin review.</p>
          ) : (
            <p className="text-gray-400 mb-8">Unfortunately, you did not pass this time. You need at least 50% to pass.</p>
          )}

          <div className="flex justify-center gap-4">
            <button onClick={() => router.push("/worker/profile")} className="px-6 py-3 rounded-xl font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-colors">
              Return to Profile
            </button>
            {!result.passed && (
              <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-xl font-bold bg-white/10 text-white hover:bg-white/20 transition-colors">
                Try Again
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentStep];
  const isLast = currentStep === questions.length - 1;
  const isAnswered = answers[q.id] !== undefined;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Skill Assessment</h1>
        <span className="px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-sm border border-cyan-500/30">
          Question {currentStep + 1} of {questions.length}
        </span>
      </div>

      <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-8 rounded-3xl glass-panel relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -z-10" />
        
        <h2 className="text-xl text-white font-medium leading-relaxed mb-8">{q.question}</h2>

        <div className="space-y-4">
          {q.options.map((opt: string, idx: number) => {
            const selected = answers[q.id] === idx;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(q.id, idx)}
                className={`w-full text-left p-5 rounded-2xl border transition-all ${
                  selected 
                    ? "bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]" 
                    : "bg-black/40 border-white/10 hover:border-white/30 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selected ? "border-cyan-400" : "border-gray-500"
                  }`}>
                    {selected && <div className="w-3 h-3 rounded-full bg-cyan-400" />}
                  </div>
                  <span className={`text-lg ${selected ? "text-cyan-100" : "text-gray-300"}`}>{opt}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex justify-end">
          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={!isAnswered || submitting}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${
                isAnswered && !submitting ? "bg-cyan-400 text-black hover:bg-cyan-300 shadow-cyan-500/30" : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Test"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${
                isAnswered ? "bg-white/10 text-white hover:bg-white/20" : "bg-gray-800 text-gray-500 cursor-not-allowed"
              }`}
            >
              Next <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
