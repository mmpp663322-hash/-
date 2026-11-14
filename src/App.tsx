import { useCallback, useEffect, useState } from 'react';
import { TopBar } from './components/TopBar';
import { QuestionOptionsPanel } from './components/QuestionOptionsPanel';
import { QuestionsList } from './components/QuestionsList';
import { NotesBox } from './components/NotesBox';
import {
  PRESET_QUESTIONS,
  QUESTION_CATEGORIES,
} from './data/presetQuestions';
import type {
  AppliedNote,
  DifficultyLevel,
  GenerateQuestionsPayload,
  GenerateQuestionsResponse,
  QAItem,
  QuestionCategoryId,
  QuestionFormat,
} from './types/qa';

const PERSONAL_NOTES_STORAGE_KEY = 'qa-platform-personal-notes-v1';
const APPLIED_NOTES_STORAGE_KEY = 'qa-platform-applied-notes-v1';

export default function App() {
  const [selectedCategory, setSelectedCategory] =
    useState<QuestionCategoryId>('general');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [format, setFormat] = useState<QuestionFormat>('qa');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [count, setCount] = useState<number>(5);

  const [questions, setQuestions] = useState<QAItem[]>(() =>
    PRESET_QUESTIONS.general.slice(0, 5)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingLabel, setLoadingLabel] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [noteInput, setNoteInput] = useState<string>('');
  const [appliedSummary, setAppliedSummary] = useState<string | null>(null);

  const [appliedNotes, setAppliedNotes] = useState<AppliedNote[]>(() => {
    try {
      const saved = localStorage.getItem(APPLIED_NOTES_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as AppliedNote[]) : [];
    } catch {
      return [];
    }
  });

  const [personalNotes, setPersonalNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(PERSONAL_NOTES_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as Record<string, string>) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        APPLIED_NOTES_STORAGE_KEY,
        JSON.stringify(appliedNotes)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [appliedNotes]);

  useEffect(() => {
    try {
      localStorage.setItem(
        PERSONAL_NOTES_STORAGE_KEY,
        JSON.stringify(personalNotes)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [personalNotes]);

  const currentCategoryLabel =
    selectedCategory === 'custom'
      ? customTopic.trim() || 'موضوع مخصص'
      : QUESTION_CATEGORIES.find((c) => c.id === selectedCategory)?.label ||
        'ثقافة عامة';

  const requestQuestions = useCallback(
    async (options: {
      category: QuestionCategoryId;
      customTopicValue?: string;
      difficultyValue: DifficultyLevel;
      countValue: number;
      notesList: string[];
      mode: 'generate' | 'apply-notes';
      previous?: QAItem[];
      label: string;
    }) => {
      setIsLoading(true);
      setLoadingLabel(options.label);
      setError(null);

      const payload: GenerateQuestionsPayload = {
        category: options.category,
        customTopic: options.customTopicValue,
        difficulty: options.difficultyValue,
        count: options.countValue,
        notes: options.notesList,
        previousQuestions: options.previous,
        mode: options.mode,
      };

      try {
        const res = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = (await res.json()) as GenerateQuestionsResponse & {
          error?: string;
        };

        if (!res.ok) {
          throw new Error(
            data.error || 'تعذر توليد الأسئلة في الوقت الحالي، يرجى المحاولة مجدداً.'
          );
        }

        setQuestions(data.questions);
        setAppliedSummary(
          options.notesList.length > 0 ? data.appliedSummary || null : null
        );
        return data;
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : 'حدث خطأ غير متوقع أثناء الاتصال بالخادم.';
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
        setLoadingLabel('');
      }
    },
    []
  );

  // If the user had active saved notes from a previous session, apply them on initial load
  useEffect(() => {
    const initialActiveNotes = appliedNotes
      .filter((n) => n.active)
      .map((n) => n.text);
    if (initialActiveNotes.length > 0) {
      void requestQuestions({
        category: 'general',
        difficultyValue: 'intermediate',
        countValue: 5,
        notesList: initialActiveNotes,
        previous: PRESET_QUESTIONS.general.slice(0, 5),
        mode: 'apply-notes',
        label: 'جارٍ تطبيق ملاحظاتك المحفوظة على الأسئلة...',
      });
    }
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectCategory = (category: QuestionCategoryId) => {
    setSelectedCategory(category);
    setError(null);

    if (category === 'custom') {
      return;
    }

    const activeNoteTexts = appliedNotes.filter((n) => n.active).map((n) => n.text);
    // If default settings (no active notes, intermediate, 5 questions), show instant preset immediately
    if (
      activeNoteTexts.length === 0 &&
      difficulty === 'intermediate' &&
      count === 5
    ) {
      setQuestions(PRESET_QUESTIONS[category].slice(0, 5));
      setAppliedSummary(null);
      return;
    }

    void requestQuestions({
      category,
      difficultyValue: difficulty,
      countValue: count,
      notesList: activeNoteTexts,
      mode: 'generate',
      label: 'جارٍ توليد أسئلة النوع المختار...',
    });
  };

  const handleDifficultyChange = (nextDifficulty: DifficultyLevel) => {
    setDifficulty(nextDifficulty);
    if (selectedCategory === 'custom' && !customTopic.trim()) return;
    const activeNoteTexts = appliedNotes.filter((n) => n.active).map((n) => n.text);
    void requestQuestions({
      category: selectedCategory,
      customTopicValue: customTopic,
      difficultyValue: nextDifficulty,
      countValue: count,
      notesList: activeNoteTexts,
      mode: 'generate',
      label: 'جارٍ ضبط الأسئلة حسب المستوى المختار...',
    });
  };

  const handleCountChange = (nextCount: number) => {
    setCount(nextCount);
    if (selectedCategory === 'custom' && !customTopic.trim()) return;
    const activeNoteTexts = appliedNotes.filter((n) => n.active).map((n) => n.text);
    void requestQuestions({
      category: selectedCategory,
      customTopicValue: customTopic,
      difficultyValue: difficulty,
      countValue: nextCount,
      notesList: activeNoteTexts,
      mode: 'generate',
      label: `جارٍ إعداد ${nextCount} أسئلة...`,
    });
  };

  const handleGenerate = async () => {
    if (selectedCategory === 'custom' && !customTopic.trim()) {
      setError('يرجى كتابة اسم الموضوع المخصص أولاً ثم الضغط على توليد.');
      return;
    }

    const pendingNoteText = noteInput.trim();
    let notesList = appliedNotes.filter((n) => n.active).map((n) => n.text);
    let createdPendingNote: AppliedNote | null = null;

    if (pendingNoteText) {
      createdPendingNote = {
        id: `note-${Date.now()}`,
        text: pendingNoteText,
        appliedAt: new Intl.DateTimeFormat('ar-SA', {
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date()),
        active: true,
      };
      notesList = [pendingNoteText, ...notesList];
    }

    const result = await requestQuestions({
      category: selectedCategory,
      customTopicValue: customTopic,
      difficultyValue: difficulty,
      countValue: count,
      notesList,
      mode: 'generate',
      label: createdPendingNote
        ? 'جارٍ توليد الأسئلة وتطبيق ملاحظاتك عليها...'
        : 'جارٍ توليد مجموعة أسئلة جديدة...',
    });

    if (result && createdPendingNote) {
      createdPendingNote.summary = result.appliedSummary;
      setAppliedNotes((prev) => [createdPendingNote!, ...prev]);
      setNoteInput('');
    }
  };

  const handleApplyNotes = async () => {
    const trimmed = noteInput.trim();
    if (!trimmed) return;

    const newNote: AppliedNote = {
      id: `note-${Date.now()}`,
      text: trimmed,
      appliedAt: new Intl.DateTimeFormat('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date()),
      active: true,
    };

    const nextNotes = [newNote, ...appliedNotes];
    const activeNoteTexts = nextNotes.filter((n) => n.active).map((n) => n.text);

    // Scroll gently up to the questions section so the user watches the update apply
    document
      .getElementById('questions-section')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const result = await requestQuestions({
      category: selectedCategory,
      customTopicValue: customTopic,
      difficultyValue: difficulty,
      countValue: count,
      notesList: activeNoteTexts,
      previous: questions,
      mode: 'apply-notes',
      label: 'جارٍ تطبيق ملاحظاتك وتحديث الأسئلة والأجوبة...',
    });

    if (result) {
      newNote.summary = result.appliedSummary;
      setAppliedNotes([newNote, ...appliedNotes]);
      setNoteInput('');
    }
  };

  const reSyncQuestionsWithNotes = async (updatedNotes: AppliedNote[]) => {
    const activeTexts = updatedNotes.filter((n) => n.active).map((n) => n.text);
    if (
      activeTexts.length === 0 &&
      selectedCategory !== 'custom' &&
      difficulty === 'intermediate' &&
      count === 5
    ) {
      setQuestions(PRESET_QUESTIONS[selectedCategory].slice(0, 5));
      setAppliedSummary(null);
      return;
    }

    await requestQuestions({
      category: selectedCategory,
      customTopicValue: customTopic,
      difficultyValue: difficulty,
      countValue: count,
      notesList: activeTexts,
      previous: questions,
      mode: activeTexts.length > 0 ? 'apply-notes' : 'generate',
      label:
        activeTexts.length > 0
          ? 'جارٍ إعادة تطبيق الملاحظات الفعّالة...'
          : 'جارٍ استعادة الأسئلة بدون ملاحظات...',
    });
  };

  const handleToggleNoteActive = (id: string) => {
    const updated = appliedNotes.map((note) =>
      note.id === id ? { ...note, active: !note.active } : note
    );
    setAppliedNotes(updated);
    void reSyncQuestionsWithNotes(updated);
  };

  const handleDeleteNote = (id: string) => {
    const wasActive = appliedNotes.find((n) => n.id === id)?.active;
    const updated = appliedNotes.filter((n) => n.id !== id);
    setAppliedNotes(updated);
    if (wasActive) {
      void reSyncQuestionsWithNotes(updated);
    }
  };

  const handleRemoveAppliedNote = (id: string) => {
    const updated = appliedNotes.map((n) =>
      n.id === id ? { ...n, active: false } : n
    );
    setAppliedNotes(updated);
    void reSyncQuestionsWithNotes(updated);
  };

  const handleClearAllNotes = () => {
    setAppliedNotes([]);
    setAppliedSummary(null);
    if (
      selectedCategory !== 'custom' &&
      difficulty === 'intermediate' &&
      count === 5
    ) {
      setQuestions(PRESET_QUESTIONS[selectedCategory].slice(0, 5));
      return;
    }
    void requestQuestions({
      category: selectedCategory,
      customTopicValue: customTopic,
      difficultyValue: difficulty,
      countValue: count,
      notesList: [],
      mode: 'generate',
      label: 'جارٍ إعادة توليد الأسئلة بدون ملاحظات...',
    });
  };

  const handleSavePersonalNote = (questionId: string, text: string) => {
    setPersonalNotes((prev) => ({ ...prev, [questionId]: text }));
  };

  return (
    <div id="top" className="min-h-screen bg-slate-950 text-slate-100">
      <TopBar onGenerateNew={handleGenerate} isLoading={isLoading} />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 space-y-8">
        {/* Compact Intro Header */}
        <div className="space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-50 text-balance">
            منصة الأسئلة والأجوبة التفاعلية
          </h1>
          <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-slate-400">
            اختر نوع الأسئلة أولاً، ثم استعرض الأسئلة وأجب عنها، وفي الأسفل اكتب
            ملاحظاتك ليتم تطبيقها وتحديث الأسئلة والأجوبة مباشرة.
          </p>
        </div>

        {/* Step 1: Question Type Options */}
        <QuestionOptionsPanel
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          customTopic={customTopic}
          onCustomTopicChange={setCustomTopic}
          format={format}
          onFormatChange={setFormat}
          difficulty={difficulty}
          onDifficultyChange={handleDifficultyChange}
          count={count}
          onCountChange={handleCountChange}
          onGenerate={handleGenerate}
          isLoading={isLoading}
        />

        {/* Step 2: Questions & Answers */}
        <QuestionsList
          questions={questions}
          categoryLabel={currentCategoryLabel}
          difficulty={difficulty}
          format={format}
          isLoading={isLoading}
          loadingLabel={loadingLabel}
          error={error}
          onRetry={handleGenerate}
          appliedNotes={appliedNotes}
          appliedSummary={appliedSummary}
          onRemoveAppliedNote={handleRemoveAppliedNote}
          personalNotes={personalNotes}
          onSavePersonalNote={handleSavePersonalNote}
        />

        {/* Step 3: Notes Box Underneath */}
        <NotesBox
          noteInput={noteInput}
          onNoteInputChange={setNoteInput}
          onApplyNotes={handleApplyNotes}
          appliedNotes={appliedNotes}
          onToggleNoteActive={handleToggleNoteActive}
          onDeleteNote={handleDeleteNote}
          onClearAllNotes={handleClearAllNotes}
          isApplying={isLoading}
        />
      </main>

      <footer className="border-t border-slate-800 bg-slate-950 py-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>منصة سؤال وجواب — تعلم ومراجعة تفاعلية باللغة العربية</span>
          <div className="flex items-center gap-4">
            <a href="#options-section" className="hover:text-slate-200">
              خيارات الأسئلة
            </a>
            <a href="#questions-section" className="hover:text-slate-200">
              الأسئلة والأجوبة
            </a>
            <a href="#notes-section" className="hover:text-slate-200">
              خانة الملاحظات
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
