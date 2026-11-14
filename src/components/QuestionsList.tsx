import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  NotebookPen,
  RotateCcw,
  X,
  XCircle,
} from 'lucide-react';
import type {
  AppliedNote,
  DifficultyLevel,
  QAItem,
  QuestionFormat,
} from '../types/qa';
import { DIFFICULTY_LABELS } from '../data/presetQuestions';

interface QuestionsListProps {
  questions: QAItem[];
  categoryLabel: string;
  difficulty: DifficultyLevel;
  format: QuestionFormat;
  isLoading: boolean;
  loadingLabel: string;
  error: string | null;
  onRetry: () => void;
  appliedNotes: AppliedNote[];
  appliedSummary: string | null;
  onRemoveAppliedNote: (id: string) => void;
  personalNotes: Record<string, string>;
  onSavePersonalNote: (questionId: string, note: string) => void;
}

const ARABIC_OPTION_LETTERS = ['أ', 'ب', 'ج', 'د'];

export function QuestionsList({
  questions,
  categoryLabel,
  difficulty,
  format,
  isLoading,
  loadingLabel,
  error,
  onRetry,
  appliedNotes,
  appliedSummary,
  onRemoveAppliedNote,
  personalNotes,
  onSavePersonalNote,
}: QuestionsListProps) {
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [selectedChoices, setSelectedChoices] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openPersonalNoteId, setOpenPersonalNoteId] = useState<string | null>(null);

  useEffect(() => {
    setRevealedIds({});
    setSelectedChoices({});
  }, [questions]);

  const activeNotes = appliedNotes.filter((n) => n.active);
  const allRevealed =
    questions.length > 0 && questions.every((q) => Boolean(revealedIds[q.id]));

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRevealAll = () => {
    if (allRevealed) {
      setRevealedIds({});
    } else {
      const next: Record<string, boolean> = {};
      questions.forEach((q) => {
        next[q.id] = true;
      });
      setRevealedIds(next);
    }
  };

  const handleSelectChoice = (questionId: string, choiceIndex: number) => {
    setSelectedChoices((prev) => ({ ...prev, [questionId]: choiceIndex }));
  };

  const resetQuiz = () => {
    setSelectedChoices({});
  };

  const handleCopy = async (item: QAItem) => {
    const text = `السؤال: ${item.question}\nالإجابة: ${item.answer}\nالتوضيح: ${item.explanation}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Clipboard may be unavailable in restricted contexts
    }
  };

  const answeredCount = questions.filter(
    (q) => selectedChoices[q.id] !== undefined
  ).length;
  const correctCount = questions.filter(
    (q) => selectedChoices[q.id] === q.correctChoiceIndex
  ).length;

  return (
    <section
      id="questions-section"
      aria-labelledby="questions-heading"
      className="rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6"
    >
      {/* Header Toolbar */}
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="questions-heading"
            className="font-display text-lg sm:text-xl font-semibold text-slate-50"
          >
            02. الأسئلة والأجوبة
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-400 tabular-nums">
            <span>{categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span>المستوى: {DIFFICULTY_LABELS[difficulty]}</span>
            <span aria-hidden="true">·</span>
            <span>{questions.length} أسئلة</span>
            {activeNotes.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-sky-400">
                  مُطبّق عليها {activeNotes.length}{' '}
                  {activeNotes.length === 1 ? 'ملاحظة' : 'ملاحظات'}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {format === 'qa' ? (
            <button
              type="button"
              onClick={toggleRevealAll}
              disabled={isLoading || questions.length === 0}
              className="min-h-[40px] inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700/80 hover:text-white disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              {allRevealed ? (
                <>
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                  <span>إخفاء كل الإجابات</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  <span>إظهار كل الإجابات</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-slate-200 tabular-nums">
                النتيجة: {correctCount} / {questions.length}{' '}
                <span className="text-xs text-slate-400">
                  (تمت الإجابة على {answeredCount})
                </span>
              </div>
              {answeredCount > 0 && (
                <button
                  type="button"
                  onClick={resetQuiz}
                  className="min-h-[38px] inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>إعادة المحاولة</span>
                </button>
              )}
            </div>
          )}

          <a
            href="#notes-section"
            className="min-h-[40px] inline-flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-950/60 px-3.5 py-2 text-xs sm:text-sm font-medium text-sky-300 transition-colors hover:bg-sky-900/60 whitespace-nowrap shrink-0"
          >
            <NotebookPen className="h-4 w-4" aria-hidden="true" />
            <span>إضافة ملاحظة بالأسفل</span>
          </a>
        </div>
      </div>

      {/* Applied Notes Confirmation Strip */}
      {(activeNotes.length > 0 || appliedSummary) && !isLoading && (
        <div className="mt-4 rounded-lg border border-sky-500/30 bg-sky-950/40 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-sky-200">
                <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" aria-hidden="true" />
                <span>الملاحظات المطبّقة على هذه الأسئلة</span>
              </div>
              {appliedSummary && (
                <p className="text-xs sm:text-sm text-sky-300/90">{appliedSummary}</p>
              )}
            </div>
          </div>

          {activeNotes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {activeNotes.map((note) => (
                <div
                  key={note.id}
                  className="inline-flex items-center gap-2 rounded-md border border-sky-500/30 bg-slate-900 px-3 py-1.5 text-xs text-slate-200"
                >
                  <span>{note.text}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveAppliedNote(note.id)}
                    aria-label={`إزالة الملاحظة: ${note.text}`}
                    className="rounded p-0.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div
          role="alert"
          className="mt-5 flex flex-col gap-3 rounded-lg border border-red-500/30 bg-red-950/40 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-2.5 text-sm text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 text-red-400 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="min-h-[38px] rounded-lg border border-red-500/40 bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-950 whitespace-nowrap shrink-0"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="mt-5 space-y-4" aria-live="polite">
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm font-medium text-slate-300">
            {loadingLabel || 'جارٍ إعداد الأسئلة والأجوبة...'}
          </div>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-lg border border-slate-800 bg-slate-950/40 p-5 space-y-3 animate-pulse"
            >
              <div className="h-4 w-24 rounded bg-slate-800" />
              <div className="h-5 w-3/4 rounded bg-slate-800" />
              <div className="h-9 w-36 rounded bg-slate-800/70" />
            </div>
          ))}
        </div>
      ) : (
        <ol className="mt-5 space-y-4">
          {questions.map((item, idx) => {
            const isRevealed = Boolean(revealedIds[item.id]);
            const selectedChoice = selectedChoices[item.id];
            const isAnswered = selectedChoice !== undefined;
            const isCorrect = selectedChoice === item.correctChoiceIndex;
            const personalNote = personalNotes[item.id] || '';
            const isPersonalOpen = openPersonalNoteId === item.id;

            return (
              <li
                key={item.id}
                className="rounded-lg border border-slate-800 bg-slate-950/50 p-4 sm:p-5 transition-colors hover:border-slate-700"
              >
                {/* Question Header & Metadata */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 tabular-nums">
                      <span className="font-semibold text-slate-300">
                        سؤال {idx + 1} من {questions.length}
                      </span>
                      {item.appliedTag && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-sky-400 font-medium">
                            {item.appliedTag}
                          </span>
                        </>
                      )}
                      {personalNote.trim() && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-400 font-medium">
                            يحتوي على تدوين شخصي
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="font-display text-base sm:text-lg font-semibold leading-relaxed tracking-wide text-slate-50">
                      {item.question}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenPersonalNoteId(isPersonalOpen ? null : item.id)
                      }
                      title="تدوين ملاحظة شخصية لهذا السؤال"
                      aria-label="تدوين ملاحظة شخصية لهذا السؤال"
                      className={`min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-md border transition-colors ${
                        personalNote.trim() || isPersonalOpen
                          ? 'border-sky-500/40 bg-sky-950/60 text-sky-300'
                          : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                      }`}
                    >
                      <NotebookPen className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(item)}
                      title="نسخ السؤال والإجابة"
                      aria-label="نسخ السؤال والإجابة"
                      className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
                    >
                      {copiedId === item.id ? (
                        <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                      ) : (
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Format 1: Q&A Mode */}
                {format === 'qa' && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => toggleReveal(item.id)}
                      aria-expanded={isRevealed}
                      className={`min-h-[40px] inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
                        isRevealed
                          ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                          : 'border-sky-600 bg-sky-600 text-white hover:bg-sky-500'
                      }`}
                    >
                      <span>{isRevealed ? 'إخفاء الإجابة' : 'إظهار الإجابة'}</span>
                      {isRevealed ? (
                        <ChevronUp className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>

                    {isRevealed && (
                      <div className="mt-4 border-t border-slate-800 pt-4 space-y-2.5">
                        <div>
                          <span className="text-xs font-semibold text-emerald-400">
                            الإجابة:
                          </span>
                          <p className="mt-1 text-sm sm:text-base font-medium leading-relaxed text-slate-100">
                            {item.answer}
                          </p>
                        </div>
                        {item.explanation && (
                          <div className="rounded-lg border border-slate-800 bg-slate-900 p-3.5 text-xs sm:text-sm leading-relaxed text-slate-300">
                            <span className="font-semibold text-slate-100">
                              التوضيح:{' '}
                            </span>
                            {item.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Format 2: Multiple Choice Quiz Mode */}
                {format === 'quiz' && (
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {item.choices.map((choice, cIdx) => {
                        const isPicked = selectedChoice === cIdx;
                        const isRightChoice = cIdx === item.correctChoiceIndex;

                        let buttonStyle =
                          'border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-700 hover:bg-slate-800';
                        if (isAnswered) {
                          if (isRightChoice) {
                            buttonStyle =
                              'border-emerald-500/60 bg-emerald-950/50 text-emerald-100 font-medium';
                          } else if (isPicked) {
                            buttonStyle =
                              'border-red-500/60 bg-red-950/50 text-red-100';
                          } else {
                            buttonStyle =
                              'border-slate-800 bg-slate-900/40 text-slate-500';
                          }
                        }

                        return (
                          <button
                            key={`${item.id}-choice-${cIdx}`}
                            type="button"
                            onClick={() => handleSelectChoice(item.id, cIdx)}
                            className={`min-h-[44px] flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-right text-sm transition-colors ${buttonStyle}`}
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-current/25 text-xs font-semibold">
                                {ARABIC_OPTION_LETTERS[cIdx] || cIdx + 1}
                              </span>
                              <span>{choice}</span>
                            </span>

                            {isAnswered && isRightChoice && (
                              <CheckCircle2
                                className="h-4 w-4 text-emerald-400 shrink-0"
                                aria-hidden="true"
                              />
                            )}
                            {isAnswered && isPicked && !isRightChoice && (
                              <XCircle
                                className="h-4 w-4 text-red-400 shrink-0"
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {isAnswered && (
                      <div
                        className={`rounded-lg border p-3.5 text-xs sm:text-sm leading-relaxed ${
                          isCorrect
                            ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-200'
                            : 'border-red-500/30 bg-red-950/40 text-red-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-semibold">
                          {isCorrect ? (
                            <>
                              <CheckCircle2
                                className="h-4 w-4 text-emerald-400 shrink-0"
                                aria-hidden="true"
                              />
                              <span>إجابة صحيحة</span>
                            </>
                          ) : (
                            <>
                              <XCircle
                                className="h-4 w-4 text-red-400 shrink-0"
                                aria-hidden="true"
                              />
                              <span>
                                إجابة غير صحيحة — الإجابة الصحيحة هي:{' '}
                                {item.choices[item.correctChoiceIndex]}
                              </span>
                            </>
                          )}
                        </div>
                        {item.explanation && (
                          <p className="mt-1.5 text-slate-300">{item.explanation}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Optional per-question personal study note */}
                {isPersonalOpen && (
                  <div className="mt-4 border-t border-slate-800 pt-3">
                    <label
                      htmlFor={`personal-note-${item.id}`}
                      className="block text-xs font-medium text-slate-300"
                    >
                      تدوين شخصي محفوظ لهذا السؤال
                    </label>
                    <textarea
                      id={`personal-note-${item.id}`}
                      rows={2}
                      value={personalNote}
                      onChange={(e) => onSavePersonalNote(item.id, e.target.value)}
                      placeholder="دوّن خلاصة أو تذكيراً خاصاً بك لهذا السؤال..."
                      className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:bg-slate-950 focus:outline-none"
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
