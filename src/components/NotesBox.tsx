import { Check, NotebookPen, RotateCcw, Trash2 } from 'lucide-react';
import type { AppliedNote } from '../types/qa';
import { NOTE_SUGGESTIONS } from '../data/presetQuestions';

interface NotesBoxProps {
  noteInput: string;
  onNoteInputChange: (value: string) => void;
  onApplyNotes: () => void;
  appliedNotes: AppliedNote[];
  onToggleNoteActive: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onClearAllNotes: () => void;
  isApplying: boolean;
}

export function NotesBox({
  noteInput,
  onNoteInputChange,
  onApplyNotes,
  appliedNotes,
  onToggleNoteActive,
  onDeleteNote,
  onClearAllNotes,
  isApplying,
}: NotesBoxProps) {
  const handleInsertSuggestion = (suggestion: string) => {
    const trimmed = noteInput.trim();
    if (!trimmed) {
      onNoteInputChange(suggestion);
      return;
    }
    if (trimmed.includes(suggestion)) {
      return;
    }
    onNoteInputChange(`${trimmed}\n${suggestion}`);
  };

  return (
    <section
      id="notes-section"
      aria-labelledby="notes-heading"
      className="rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <h2
            id="notes-heading"
            className="font-display text-lg sm:text-xl font-semibold text-slate-50"
          >
            03. خانة الملاحظات وتطبيقها على الأسئلة
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            اكتب ملاحظاتك أو تعديلاتك المطلوبة هنا، وعند الضغط على «تطبيق الملاحظات»
            سيتم تحديث الأسئلة والأجوبة في الأعلى وفق تعليماتك فوراً.
          </p>
        </div>
        <div className="text-xs text-slate-400 whitespace-nowrap">
          تخصيص مباشر للأسئلة
        </div>
      </div>

      {/* Main Notes Textarea */}
      <div className="mt-5">
        <label
          htmlFor="main-notes-textarea"
          className="flex items-center gap-2 text-sm font-medium text-slate-200"
        >
          <NotebookPen className="h-4 w-4 text-sky-400" aria-hidden="true" />
          <span>اكتب ملاحظاتك هنا:</span>
        </label>
        <textarea
          id="main-notes-textarea"
          rows={4}
          value={noteInput}
          onChange={(e) => onNoteInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (
              (e.ctrlKey || e.metaKey) &&
              e.key === 'Enter' &&
              noteInput.trim() &&
              !isApplying
            ) {
              e.preventDefault();
              onApplyNotes();
            }
          }}
          placeholder="مثال: اجعل الإجابات مختصرة جداً، أضف أمثلة عملية لكل إجابة، ركّز على أسئلة الذكاء الاصطناعي، صِغ الأسئلة بأسلوب ممتع للطلاب..."
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/80 p-3.5 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        />
      </div>

      {/* Interactive Quick Suggestion Buttons */}
      <div className="mt-4">
        <span className="block text-xs font-medium text-slate-400">
          اقتراحات سريعة (اضغط لإضافتها إلى الخانة):
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {NOTE_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleInsertSuggestion(suggestion)}
              className="min-h-[36px] rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-sky-500/50 hover:bg-sky-950/50 hover:text-sky-200"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Apply Action */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onApplyNotes}
            disabled={isApplying || !noteInput.trim()}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            <span>
              {isApplying
                ? 'جارٍ تطبيق الملاحظات على الأسئلة...'
                : 'تطبيق الملاحظات على الأسئلة'}
            </span>
          </button>

          {noteInput.trim() && (
            <button
              type="button"
              onClick={() => onNoteInputChange('')}
              disabled={isApplying}
              className="min-h-[44px] rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              تفريغ الخانة
            </button>
          )}
        </div>

        {appliedNotes.length > 0 && (
          <button
            type="button"
            onClick={onClearAllNotes}
            disabled={isApplying}
            className="min-h-[40px] inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-medium text-slate-400 hover:border-red-500/40 hover:bg-red-950/40 hover:text-red-300"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>إلغاء كل الملاحظات المطبّقة</span>
          </button>
        )}
      </div>

      {/* Applied Notes History List */}
      <div id="applied-notes-list" className="mt-6 border-t border-slate-800 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-sm font-semibold text-slate-100">
            سجل الملاحظات المطبّقة ({appliedNotes.length})
          </h3>
          <span className="text-xs text-slate-400">
            يمكنك تفعيل أو إيقاف أي ملاحظة ليُعاد تطبيقها على الأسئلة
          </span>
        </div>

        {appliedNotes.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-slate-800 bg-slate-950/50 p-4 text-xs sm:text-sm text-slate-400">
            لم تُطبَّق أي ملاحظات بعد. اكتب ملاحظتك في الخانة أعلاه واضغط على «تطبيق
            الملاحظات على الأسئلة» لمشاهدة التغيير مباشرة.
          </p>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {appliedNotes.map((note) => (
              <li
                key={note.id}
                className={`flex flex-col gap-3 rounded-lg border p-3.5 sm:flex-row sm:items-center sm:justify-between ${
                  note.active
                    ? 'border-sky-500/30 bg-sky-950/30'
                    : 'border-slate-800 bg-slate-950/50 opacity-75'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span
                      className={`font-semibold ${
                        note.active ? 'text-sky-400' : 'text-slate-400'
                      }`}
                    >
                      {note.active ? 'مطبّقة حالياً' : 'موقوفة مؤقتاً'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{note.appliedAt}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-100">{note.text}</p>
                  {note.summary && (
                    <p className="text-xs text-slate-400">{note.summary}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleNoteActive(note.id)}
                    disabled={isApplying}
                    className={`min-h-[36px] rounded-md border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      note.active
                        ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                        : 'border-sky-600 bg-sky-600 text-white hover:bg-sky-500'
                    }`}
                  >
                    {note.active ? 'إيقاف التطبيق' : 'إعادة التطبيق'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteNote(note.id)}
                    disabled={isApplying}
                    aria-label={`حذف الملاحظة: ${note.text}`}
                    className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-400 hover:border-red-500/40 hover:bg-red-950/40 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
