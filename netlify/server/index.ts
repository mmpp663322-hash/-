import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';

interface RequestBody {
  category?: string;
  customTopic?: string;
  difficulty?: string;
  count?: number;
  notes?: string[];
  previousQuestions?: Array<{
    question: string;
    answer: string;
    explanation: string;
  }>;
  mode?: 'generate' | 'apply-notes';
}

const CATEGORY_MAP: Record<string, string> = {
  general: 'ثقافة عامة ومعارف متنوعة',
  science: 'العلوم والتقنية والفضاء والأحياء',
  history: 'التاريخ والجغرافيا والحضارات',
  arabic: 'اللغة العربية والأدب والبلاغة والنحو',
  logic: 'المنطق والذكاء والتفكير النقدي والألغاز الذهنية',
};

const DIFFICULTY_MAP: Record<string, string> = {
  beginner: 'مبتدئ (مباشر وواضح ومناسب للجميع)',
  intermediate: 'متوسط (يتطلب فهماً ومعرفة جيدة)',
  advanced: 'متقدم (عميق وتفصيلي ويتطلب تحليلاً دقيقاً)',
};

const app = express();
app.use(express.json({ limit: '1mb' }));

// Netlify AI Gateway injects credentials and base URL automatically.
const ai = new GoogleGenAI({});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/questions', async (req, res) => {
  // AI generation can take longer than the platform's 20s header timeout.
  // Send headers immediately and keep the connection alive with whitespace
  // (valid leading JSON whitespace) until the final payload is ready.
  res.status(200);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.flushHeaders();
  const heartbeat = setInterval(() => res.write(' '), 5000);
  const reply = (payload: Record<string, unknown>) => {
    clearInterval(heartbeat);
    res.end(JSON.stringify(payload));
  };
  req.on('close', () => clearInterval(heartbeat));

  const body = (req.body || {}) as RequestBody;
  const categoryId = body.category || 'general';
  const customTopic = (body.customTopic || '').trim();
  const difficultyId = body.difficulty || 'intermediate';
  const count = Math.min(Math.max(Number(body.count) || 5, 3), 12);
  const notes = Array.isArray(body.notes)
    ? body.notes.map((n) => String(n).trim()).filter(Boolean)
    : [];
  const mode = body.mode === 'apply-notes' ? 'apply-notes' : 'generate';

  const topicDescription =
    categoryId === 'custom' && customTopic
      ? `موضوع مخصص: "${customTopic}"`
      : CATEGORY_MAP[categoryId] || CATEGORY_MAP.general;

  const difficultyDescription =
    DIFFICULTY_MAP[difficultyId] || DIFFICULTY_MAP.intermediate;

  const notesBlock =
    notes.length > 0
      ? `\n\nملاحظات وتعليمات المستخدم التي يجب تطبيقها بدقة وصرامة على كل سؤال وإجابة:\n${notes
          .map((note, idx) => `${idx + 1}. ${note}`)
          .join('\n')}`
      : '';

  const previousBlock =
    mode === 'apply-notes' &&
    Array.isArray(body.previousQuestions) &&
    body.previousQuestions.length > 0
      ? `\n\nالأسئلة الحالية المراد تعديلها أو إعادة صياغتها لتطبيق ملاحظات المستخدم (أو تحديثها بما يوافق الملاحظات مع الحفاظ على التنوع والجودة):\n${body.previousQuestions
          .slice(0, count)
          .map((q, idx) => `${idx + 1}) ${q.question} — الإجابة الحالية: ${q.answer}`)
          .join('\n')}`
      : '';

  const prompt =
    mode === 'apply-notes'
      ? `قم بتطبيق ملاحظات المستخدم التالية على مجموعة الأسئلة والأجوبة الخاصة بمجال (${topicDescription}) بمستوى (${difficultyDescription}).
المطلوب إنتاج ${count} أسئلة وأجوبة باللغة العربية الفصحى السليمة والواضحة.${notesBlock}${previousBlock}

تأكد من:
1. أن تعكس الأسئلة والأجوبة والتوضيحات جميع ملاحظات المستخدم المذكورة أعلاه بشكل واضح وملموس.
2. أن يحتوي كل سؤال على 4 خيارات منطقية متقاربة الطول (choices) مع تحديد رقم الإجابة الصحيحة (correctChoiceIndex من 0 إلى 3) بحيث يتطابق الخيار الصحيح تماماً مع الإجابة (answer).
3. أن تكتب ملخصاً موجزاً من جملة واحدة في الحقل appliedSummary يشرح للمستخدم كيف تم تطبيق ملاحظاته على الأسئلة.`
      : `أنشئ ${count} أسئلة وأجوبة تعليمية شيّقة ودقيقة باللغة العربية الفصحى حول المجال: (${topicDescription}) وبمستوى صعوبة: (${difficultyDescription}).${notesBlock}

تأكد من:
1. تنوّع الأسئلة ووضوح صياغتها وعدم تكرار الأفكار.
2. دقة الإجابة المباشرة (answer) ووجود توضيح موجز ومفيد (explanation) لا يتجاوز سطرين.
3. تضمين 4 خيارات للاختيار من متعدد (choices) في كل سؤال بحيث تكون متوازنة ومقنعة، مع تحديد رقم الخيار الصحيح (correctChoiceIndex من 0 إلى 3) متطابقاً مع الإجابة.
4. إذا وُجدت ملاحظات للمستخدم أعلاه، التزم بها بالكامل واذكر ذلك باختصار في appliedSummary.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction:
          'أنت خبير تعليمي ومُعدّ محتوى عربي دقيق. تُنتج دائماً أسئلة وأجوبة صحيحة علمياً وتاريخياً ولغوياً بصياغة عربية سلسة ومضبوطة، وتلتزم حرفياً بأي ملاحظات أو تعليمات يضيفها المستخدم.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            appliedSummary: {
              type: Type.STRING,
              description:
                'جملة عربية قصيرة توضح كيف تم تخصيص الأسئلة أو تطبيق ملاحظات المستخدم.',
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: {
                    type: Type.STRING,
                    description: 'نص السؤال باللغة العربية.',
                  },
                  answer: {
                    type: Type.STRING,
                    description: 'الإجابة الصحيحة المباشرة.',
                  },
                  explanation: {
                    type: Type.STRING,
                    description: 'توضيح أو معلومة إضافية موجزة تدعم الإجابة.',
                  },
                  choices: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'أربعة خيارات للإجابة بحيث يكون أحدها صحيحاً.',
                  },
                  correctChoiceIndex: {
                    type: Type.INTEGER,
                    description: 'فهرس الإجابة الصحيحة من 0 إلى 3.',
                  },
                },
                required: [
                  'question',
                  'answer',
                  'explanation',
                  'choices',
                  'correctChoiceIndex',
                ],
              },
            },
          },
          required: ['questions', 'appliedSummary'],
        },
      },
    });

    const rawText = (response.text ?? '{}').trim();
    const parsed = JSON.parse(rawText) as {
      appliedSummary?: string;
      questions?: Array<{
        question: string;
        answer: string;
        explanation: string;
        choices: string[];
        correctChoiceIndex: number;
      }>;
    };

    const sanitizedQuestions = (parsed.questions || []).slice(0, count).map((item, idx) => {
      const safeChoices =
        Array.isArray(item.choices) && item.choices.length >= 2
          ? item.choices.slice(0, 4)
          : [item.answer, 'خيار آخر', 'لا ينطبق', 'غير ذلك'];
      while (safeChoices.length < 4) {
        safeChoices.push('لا ينطبق');
      }
      const rawIdx = Number(item.correctChoiceIndex);
      const safeIdx =
        Number.isInteger(rawIdx) && rawIdx >= 0 && rawIdx < safeChoices.length ? rawIdx : 0;

      return {
        id: `ai-${Date.now()}-${idx}`,
        question: String(item.question || '').trim(),
        answer: String(item.answer || '').trim(),
        explanation: String(item.explanation || '').trim(),
        choices: safeChoices.map((c) => String(c).trim()),
        correctChoiceIndex: safeIdx,
        appliedTag: notes.length > 0 ? 'مخصّص وفق ملاحظاتك' : undefined,
      };
    });

    if (sanitizedQuestions.length === 0) {
      reply({
        error: 'لم يتمكن النظام من صياغة الأسئلة بالشكل المطلوب، يرجى المحاولة مرة أخرى.',
      });
      return;
    }

    reply({
      questions: sanitizedQuestions,
      appliedSummary:
        parsed.appliedSummary ||
        (notes.length > 0 ? 'تم تطبيق ملاحظاتك على الأسئلة والأجوبة.' : undefined),
    });
  } catch (err) {
    console.error('Gemini Q&A error:', err);
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('PERMISSION_DENIED') || message.includes('API_KEY_INVALID')) {
      reply({
        error: 'تعذر الوصول إلى خدمة الذكاء الاصطناعي حالياً، يرجى المحاولة لاحقاً.',
      });
      return;
    }
    if (message.includes('RESOURCE_EXHAUSTED') || message.includes('429')) {
      reply({
        error: 'تم تجاوز حد الطلبات المؤقت، يرجى الانتظار لحظات والمحاولة مجدداً.',
      });
      return;
    }
    reply({
      error: 'حدث خطأ أثناء توليد الأسئلة، يرجى المحاولة مرة أخرى.',
    });
  }
});

export const config = {
  path: '/api/*',
};

export default app;
