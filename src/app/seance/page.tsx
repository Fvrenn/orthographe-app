"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { FeedbackView, LessonView, QuestionView, SummaryView } from "@/components/SessionViews";

export default function Seance() {
  const { ses, ready } = useApp();
  const router = useRouter();
  // Pas de séance (terminée, ou enregistrée un autre jour) : retour à l'accueil.
  useEffect(() => { if (ready && !ses) router.replace("/"); }, [ready, ses, router]);
  if (!ses) return null;
  return ses.phase === "lesson" ? <LessonView />
    : ses.phase === "q" ? <QuestionView />
    : ses.phase === "fb" ? <FeedbackView />
    : <SummaryView />;
}
