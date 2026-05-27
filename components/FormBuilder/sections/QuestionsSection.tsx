"use client";

import { useState } from "react";
import type { FormConfig, Question, QuestionType, Toast } from "@/lib/formBuilderTypes";
import { QUESTION_TYPE_META } from "@/lib/formBuilderConstants";
import QuestionCard from "../QuestionCard";
import AddQuestionModal from "../AddQuestionModal";
import { Plus } from "lucide-react";

interface Props {
  form: FormConfig;
  updateForm: (updater: (prev: FormConfig) => FormConfig) => void;
  addToast: (msg: string, type?: Toast["type"]) => void;
}

export default function QuestionsSection({ form, updateForm, addToast }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  function addQuestion(type: QuestionType) {
    const meta = QUESTION_TYPE_META[type];
    const newQ: Question = {
      id: `q-${Date.now()}`,
      type,
      label: meta.defaultLabel,
      required: false,
      ...(type === "rating" || type === "nps" ? { minRating: 1, maxRating: type === "rating" ? 5 : 10, lowLabel: "Poor", highLabel: "Excellent" } : {}),
      ...(type === "select" || type === "multiselect" ? { options: [{ id: `o-${Date.now()}-1`, label: "Option 1" }, { id: `o-${Date.now()}-2`, label: "Option 2" }] } : {}),
    };
    updateForm(prev => ({ ...prev, questions: [...prev.questions, newQ] }));
    addToast(`${meta.label} question added`, "success");
  }

  function updateQuestion(id: string, q: Question) {
    updateForm(prev => ({ ...prev, questions: prev.questions.map(x => x.id === id ? q : x) }));
  }

  function deleteQuestion(id: string) {
    updateForm(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== id) }));
    addToast("Question removed", "info");
  }

  function handleDragStart(e: React.DragEvent, index: number) {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) { setDraggingIndex(null); return; }
    updateForm(prev => {
      const qs = [...prev.questions];
      const [item] = qs.splice(draggingIndex, 1);
      qs.splice(index, 0, item);
      return { ...prev, questions: qs };
    });
    setDraggingIndex(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {form.questions.length === 0 && (
        <div style={{
          padding: "32px 20px", textAlign: "center",
          border: "1px dashed rgba(255,255,255,0.12)", borderRadius: "12px",
        }}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>📋</div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>No questions yet</div>
          <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}>Add your first question below</div>
        </div>
      )}

      {form.questions.map((q, i) => (
        <QuestionCard
          key={q.id}
          question={q}
          index={i}
          onChange={updated => updateQuestion(q.id, updated)}
          onDelete={() => deleteQuestion(q.id)}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          isDragging={draggingIndex === i}
        />
      ))}

      <button
        onClick={() => setShowModal(true)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          padding: "10px", borderRadius: "10px",
          background: "rgba(201,169,110,0.08)",
          border: "1px dashed rgba(201,169,110,0.3)",
          color: "#C9A96E", fontSize: "13px", fontWeight: 600,
          cursor: "pointer", marginTop: "4px",
          transition: "background 150ms",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(201,169,110,0.14)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(201,169,110,0.08)")}
      >
        <Plus size={15} />
        Add Question
      </button>

      {showModal && (
        <AddQuestionModal
          onAdd={addQuestion}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
