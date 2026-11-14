interface TopBarProps {
  onGenerateNew: () => void;
  isLoading: boolean;
}

export function TopBar({ onGenerateNew, isLoading }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        <a
          href="#top"
          className="font-display text-lg font-bold tracking-tight text-slate-50 whitespace-nowrap shrink-0"
        >
          سؤال وجواب
        </a>

        <nav
          aria-label="التنقل الرئيسي"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400"
        >
          <a
            href="#options-section"
            className="hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            أنواع الأسئلة
          </a>
          <a
            href="#questions-section"
            className="hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            الأسئلة والأجوبة
          </a>
          <a
            href="#notes-section"
            className="hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            خانة الملاحظات
          </a>
          <a
            href="#applied-notes-list"
            className="hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            الملاحظات المطبّقة
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onGenerateNew}
            disabled={isLoading}
            className="min-h-[40px] rounded-lg bg-sky-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
          >
            {isLoading ? 'جارٍ التوليد...' : 'توليد أسئلة جديدة'}
          </button>
        </div>
      </div>
    </header>
  );
}
