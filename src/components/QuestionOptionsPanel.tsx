import {
  BookOpen,
  Compass,
  Cpu,
  Globe,
  Lightbulb,
  PenTool,
  RefreshCw,
} from 'lucide-react';
import type {
  DifficultyLevel,
  QuestionCategoryId,
  QuestionFormat,
} from '../types/qa';
import { DIFFICULTY_LABELS, QUESTION_CATEGORIES } from '../data/presetQuestions';

interface QuestionOptionsPanelProps {
  selectedCategory: QuestionCategoryId;
  onSelectCategory: (category: QuestionCategoryId) => void;
  customTopic: string;
  onCustomTopicChange: (topic: string) => void;
  format: QuestionFormat;
  onFormatChange: (format: QuestionFormat) => void;
  difficulty: DifficultyLevel;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
  count: number;
  onCountChange: (count: number) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const CATEGORY_ICONS: Record<QuestionCategoryId, typeof Globe> = {
  general: Globe,
  science: Cpu,
  history: Compass,
  arabic: BookOpen,
  logic: Lightbulb,
  custom: PenTool,
};

export function QuestionOptionsPanel({
  selectedCategory,
  onSelectCategory,
  customTopic,
  onCustomTopicChange,
  format,
  onFormatChange,
  difficulty,
  onDifficultyChange,
  count,
  onCountChange,
  onGenerate,
  isLoading,
}: QuestionOptionsPanelProps) {
  return (
    <section
      id="options-section"
      aria-labelledby="options-heading"
      className="rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <h2
            id="options-heading"
            className="font-display text-lg sm:text-xl font-semibold text-slate-50"
          >
            01. خيارات نوع الأسئلة
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            اختر مجال الأسئلة، وطريقة العرض، ومستوى الصعوبة المناسب لك.
          </p>
        </div>
        <div className="text-xs text-slate-400 whitespace-nowrap">
          الخطوة الأولى من ٣
        </div>
      </div>

      {/* Question Type Grid */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {QUESTION_CATEGORIES.map((category) => {
          const Icon = CATEGORY_ICONS[category.id];
          const isActive = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              aria-pressed={isActive}
              className={`group flex items-start gap-3.5 rounded-lg border p-4 text-right transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 min-h-[44px] ${
                isActive
                  ? 'border-sky-500 bg-sky-950/60 text-slate-100'
                  : 'border-slate-800 bg-slate-950/50 text-slate-200 hover:border-slate-700 hover:bg-slate-800/70'
              }`}
            >
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors ${
                  isActive
                    ? 'border-sky-500/40 bg-sky-600 text-white'
                    : 'border-slate-700 bg-slate-800 text-slate-300 group-hover:text-slate-100'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-semibold text-slate-100">
                  {category.label}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  {category.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Topic Input when 'custom' is chosen */}
      {selectedCategory === 'custom' && (
        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/70 p-4">
          <label
            htmlFor="custom-topic-input"
            className="block text-sm font-medium text-slate-200"
          >
            اكتب الموضوع المخصص الذي تريد توليد أسئلة حوله
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="custom-topic-input"
              type="text"
              value={customTopic}
              onChange={(e) => onCustomTopicChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customTopic.trim() && !isLoading) {
                  onGenerate();
                }
              }}
              placeholder="مثال: الأمن السيبراني، التغذية الصحية، تاريخ الأندلس، البرمجة بلغة بايثون..."
              className="min-h-[44px] flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
            <button
              type="button"
              onClick={onGenerate}
              disabled={isLoading || !customTopic.trim()}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>توليد أسئلة الموضوع</span>
            </button>
          </div>
        </div>
      )}

      {/* Format, Difficulty, and Count Controls */}
      <div className="mt-5 flex flex-col gap-4 border-t border-slate-800 pt-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:flex lg:flex-wrap lg:items-center lg:gap-6">
          {/* Mode / Format */}
          <div>
            <span className="mb-1.5 block text-xs font-medium text-slate-400">
              صيغة الأسئلة
            </span>
            <div
              role="group"
              aria-label="صيغة الأسئلة"
              className="inline-flex rounded-lg border border-slate-800 bg-slate-950 p-1"
            >
              <button
                type="button"
                onClick={() => onFormatChange('qa')}
                className={`min-h-[36px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  format === 'qa'
                    ? 'bg-slate-800 text-slate-50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                سؤال وجواب
              </button>
              <button
                type="button"
                onClick={() => onFormatChange('quiz')}
                className={`min-h-[36px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  format === 'quiz'
                    ? 'bg-slate-800 text-slate-50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                اختيار من متعدد
              </button>
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <span className="mb-1.5 block text-xs font-medium text-slate-400">
              المستوى
            </span>
            <div
              role="group"
              aria-label="مستوى الصعوبة"
              className="inline-flex rounded-lg border border-slate-800 bg-slate-950 p-1"
            >
              {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map(
                (level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onDifficultyChange(level)}
                    className={`min-h-[36px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      difficulty === level
                        ? 'bg-slate-800 text-slate-50'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {DIFFICULTY_LABELS[level]}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Count */}
          <div>
            <span className="mb-1.5 block text-xs font-medium text-slate-400">
              عدد الأسئلة
            </span>
            <div
              role="group"
              aria-label="عدد الأسئلة"
              className="inline-flex rounded-lg border border-slate-800 bg-slate-950 p-1 tabular-nums"
            >
              {[5, 8, 12].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onCountChange(num)}
                  className={`min-h-[36px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    count === num
                      ? 'bg-slate-800 text-slate-50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {num} أسئلة
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading || (selectedCategory === 'custom' && !customTopic.trim())}
          className="min-h-[42px] inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-800 hover:border-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
        >
          <RefreshCw
            className={`h-4 w-4 text-slate-300 ${isLoading ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          <span>توليد مجموعة أسئلة بالخيارات المختارة</span>
        </button>
      </div>
    </section>
  );
}
