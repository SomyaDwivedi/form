import React, { memo } from "react";
import { Sidebar } from "./Sidebar";
import { QuestionCard } from "./QuestionCard";
import { PreviewModal } from "./PreviewModal";
import { Header } from "./Header";
import ErrorAlert from "../common/ErrorAlert";
import { Question } from "../../types";

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
type Level = (typeof LEVELS)[number];

interface SurveyLayoutProps {
  questions: Question[];
  questionsByLevel: Record<Level, Question[]>;
  currentIndex: number;
  currentLevel: Level;
  completedCount: number;
  showPreview: boolean;
  isSubmitting: boolean;
  error: string;
  mode: "create" | "edit";

  onSelectQuestion: (level: Level, index: number) => void;
  onAddQuestion: (level: Level) => void;
  onPrev: () => void;
  onNext: () => void;
  onDeleteCurrent: () => void;
  onDeleteAllQuestions: (level: Level) => void;

  onUpdateQuestion: (field: keyof Question, value: string) => void;
  onCreateNew: () => void;
  onUpdate: () => void;
  onSwitchToCreate: () => void;
  onSwitchToEdit: () => void;
  onPreview: () => void;
  onClosePreview: () => void;
  onLogout: () => void;
  onErrorDismiss: () => void;

  formTitle: string;
  formDescription: string;
}

function SurveyLayout({
  questions,
  questionsByLevel,
  currentIndex,
  currentLevel,
  completedCount,
  showPreview,
  isSubmitting,
  error,
  mode,
  onSelectQuestion,
  onAddQuestion,
  onPrev,
  onNext,
  onDeleteCurrent,
  onDeleteAllQuestions,
  onUpdateQuestion,
  onCreateNew,
  onUpdate,
  onSwitchToCreate,
  onSwitchToEdit,
  onPreview,
  onClosePreview,
  onLogout,
  onErrorDismiss,
  formTitle,
  formDescription,
}: SurveyLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <Header
        completedCount={completedCount}
        totalCount={questions.length}
        mode={mode}
        onPreview={onPreview}
        onCreateNew={onCreateNew}
        onUpdate={onUpdate}
        onSwitchToCreate={onSwitchToCreate}
        onSwitchToEdit={onSwitchToEdit}
        isSubmitting={isSubmitting}
        onLogout={onLogout}
      />

      {error && <ErrorAlert message={error} onDismiss={onErrorDismiss} />}

      <div className="flex flex-col xl:flex-row px-16 py-8 flex justify-between items-start">
        {/* Sidebar */}
        <aside className="w-[700px] flex-shrink-0">
          <MemoizedSidebar
            questionsByLevel={questionsByLevel}
            currentLevel={currentLevel}
            currentIndex={currentIndex}
            onSelect={onSelectQuestion}
            onAdd={onAddQuestion}
            onDeleteAll={onDeleteAllQuestions}
            completedCount={completedCount}
          />
        </aside>

        {/* Main Content: extra wide */}
        <main className="flex-1 flex flex-col items-center">
          <section className="w-full max-w-4xl xl:max-w-12xl">
            {/* Survey Title and Current Level */}
            <div className="bg-white rounded-2xl shadow border border-gray-100 px-10 py-7 mb-7">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">{formTitle}</h1>
                  <p className="text-gray-600 text-base">{formDescription}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">Current Level</div>
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow ${
                      currentLevel === "Beginner"
                        ? "bg-green-100 text-green-700"
                        : currentLevel === "Intermediate"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {currentLevel}
                  </div>
                </div>
              </div>
            </div>

            {/* Question Content */}
            <div className="flex-1 min-h-0">
              {questions.length === 0 ? (
                <div className="bg-white rounded-2xl shadow border border-gray-100 p-12 text-center h-full flex items-center justify-center">
                  <div>
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Questions Yet</h3>
                    <p className="text-gray-500 mb-6">
                      Start building your survey by adding questions to any difficulty level.
                    </p>
                    <div className="flex gap-3 justify-center">
                      {LEVELS.map((level) => (
                        <button
                          key={level}
                          onClick={() => onAddQuestion(level)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            level === "Beginner"
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : level === "Intermediate"
                              ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                              : "bg-red-600 hover:bg-red-700 text-white"
                          }`}
                        >
                          Add {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                questions[currentIndex] && (
                  <div className="h-full">
                    <MemoizedQuestionCard
                      question={questions[currentIndex]}
                      index={currentIndex}
                      isFirst={currentIndex === 0}
                      isLast={currentIndex === questions.length - 1}
                      onPrev={onPrev}
                      onNext={onNext}
                      onDelete={onDeleteCurrent}
                      onUpdate={onUpdateQuestion}
                      onAddNext={() => onAddQuestion(currentLevel)}
                      currentTabLevel={currentLevel}
                    />
                  </div>
                )
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          title={formTitle}
          description={formDescription}
          questions={questions}
          mode={mode}
          onClose={onClosePreview}
          onCreateNew={onCreateNew}
          onUpdate={onUpdate}
          isSubmitting={isSubmitting}
          completedCount={completedCount}
        />
      )}
    </div>
  );
}

const MemoizedSidebar = memo(Sidebar);
const MemoizedQuestionCard = memo(QuestionCard);

export default SurveyLayout;