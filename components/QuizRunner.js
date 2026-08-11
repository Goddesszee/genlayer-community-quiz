"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getRandomQuestions } from "@/lib/questions";

const POINTS_PER_QUESTION = 10;
const LETTERS = ["A", "B", "C", "D"];

const CATEGORY_LABEL = {
  genlayer: "GenLayer",
  ai: "AI",
  web3: "Web3",
};

export default function QuizRunner() {
  const router = useRouter();
  const [username, setUsername] = useState(null);
  const questions = useMemo(() => getRandomQuestions(10), []);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]); // track correctness per question

  useEffect(() => {
    const stored = localStorage.getItem("glq_username");
    if (!stored) {
      router.replace("/");
      return;
    }
    setUsername(stored);
  }, [router]);

  if (username === null) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center text-[var(--text-dim)]">
        Loading…
      </div>
    );
  }

  const question = questions[index];
  const isLast = index === questions.length - 1;

  function handleSelect(optionIdx) {
    if (selected !== null) return; // already answered
    setSelected(optionIdx);

    const isCorrect = optionIdx === question.correctIndex;
    if (isCorrect) setScore((s) => s + POINTS_PER_QUESTION);
    setAnswers((a) => [...a, isCorrect]);
  }

  function handleNext() {
    if (selected === null) return;

    if (isLast) {
      const finalScore = score; // score state already includes this question's points
      sessionStorage.setItem(
        "glq_result",
        JSON.stringify({
          username,
          score: finalScore,
          total: questions.length * POINTS_PER_QUESTION,
          correct: answers.filter(Boolean).length,
        })
      );
      router.push("/results");
      return;
    }

    setIndex((i) => i + 1);
    setSelected(null);
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-10 sm:py-14">
      <div className="mb-6 flex items-center justify-between">
        <span
          style={{ fontFamily: "var(--font-mono)" }}
          className="text-xs text-[var(--text-dim)]"
        >
          QUESTION {String(index + 1).padStart(2, "0")}/{String(questions.length).padStart(2, "0")}
        </span>
        <span
          style={{ fontFamily: "var(--font-mono)" }}
          className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[11px] text-[var(--text-dim)]"
        >
          {CATEGORY_LABEL[question.category]}
        </span>
      </div>

      <div className="confirm-strip mb-8" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={questions.length}>
        {questions.map((q, i) => (
          <div
            key={q.id}
            className="confirm-seg"
            data-state={i < index ? "done" : i === index ? "current" : "todo"}
          />
        ))}
      </div>

      <div key={question.id} className="card-pop">
        <h2
          style={{ fontFamily: "var(--font-display)" }}
          className="mb-6 text-xl font-semibold leading-snug text-[var(--text)] sm:text-2xl"
        >
          {question.question}
        </h2>

        <div className="flex flex-col gap-3">
          {question.options.map((option, i) => {
            const isSelected = selected === i;
            const isCorrectAnswer = i === question.correctIndex;
            const showState = selected !== null;

            let stateClasses =
              "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/60 hover:bg-[var(--surface-2)]";
            if (showState && isCorrectAnswer) {
              stateClasses = "border-[var(--accent-2)] bg-[var(--accent-2-soft)]";
            } else if (showState && isSelected && !isCorrectAnswer) {
              stateClasses = "border-[var(--danger)] bg-[var(--danger-soft)]";
            } else if (showState) {
              stateClasses = "border-[var(--border)] bg-[var(--surface)] opacity-50";
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(i)}
                disabled={selected !== null}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm text-[var(--text)] transition-colors disabled:cursor-default ${stateClasses}`}
              >
                <span
                  style={{ fontFamily: "var(--font-mono)" }}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[11px] text-[var(--text-dim)]"
                >
                  {LETTERS[i]}
                </span>
                <span className="flex-1">{option}</span>
                {showState && isCorrectAnswer && (
                  <span className="text-[var(--accent-2)]" aria-label="Correct">✓</span>
                )}
                {showState && isSelected && !isCorrectAnswer && (
                  <span className="text-[var(--danger)]" aria-label="Incorrect">✕</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-7 flex items-center justify-between">
          <span style={{ fontFamily: "var(--font-mono)" }} className="text-xs text-[var(--text-dim)]">
            SCORE {score}
          </span>
          <button
            type="button"
            onClick={handleNext}
            disabled={selected === null}
            className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#0a0d16] transition-opacity disabled:cursor-not-allowed disabled:opacity-30 hover:brightness-110"
          >
            {isLast ? "See results →" : "Next question →"}
          </button>
        </div>
      </div>
    </div>
  );
}
