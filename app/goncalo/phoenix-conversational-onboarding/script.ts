export const MEMBER = 'Alex';
export const PT = 'Lauren';

export const BODY_AREAS = [
  'Neck',
  'Shoulder',
  'Upper back',
  'Lower back',
  'Hip',
  'Knee',
  'Ankle',
  'Wrist',
  'Elbow',
  'Head',
] as const;

export const DURATIONS = [
  'Less than 2 weeks',
  '2–4 weeks',
  '1 to 3 months',
  'More than 3 months',
] as const;

export type DoorId = 'assessment' | 'how' | 'question';

export const GUIDE_LINES = [
  `Hi ${MEMBER}, I’m Phoenix.`,
  'I’ll be guiding your care, alongside a real physical therapist.',
  'Let’s start with a few questions to understand what you’re feeling.',
  'It takes about 2 minutes. Ready?',
] as const;

export const DISCLAIMER =
  'Your answers are confidential and won’t be shared';

export const READY_LABEL = 'I’m ready';

export const THERAPIST_PHRASE = 'real physical therapist';

export const DOORS: { id: DoorId; label: string }[] = [
  { id: 'assessment', label: 'Start my assessment' },
  { id: 'how', label: 'How it works' },
  { id: 'question', label: 'I have a question' },
];

export type Answers = {
  area: string | null;
  duration: string | null;
  intensity: number | null;
  tingling: boolean | null;
};

export type StackTurn = {
  id: string;
  role: 'phoenix' | 'member';
  text: string;
  kind: 'guide' | 'question' | 'care' | 'answer';
};

export function areaQuestion() {
  return 'Let’s start with where you’re hurting most.';
}

export function durationQuestion() {
  return 'When did that start?';
}

export function intensityQuestion() {
  return 'How intense has it been lately?';
}

export function followUpQuestion(area: string) {
  if (area === 'Neck' || area === 'Shoulder') {
    return 'Do you feel tingling or numbness down your arm?';
  }
  if (area === 'Lower back' || area === 'Hip') {
    return 'Does it travel down your leg?';
  }
  return 'Does it change when you move?';
}

export function doorsLine() {
  return 'Then let’s get you started.';
}

export function durationCareLine(duration: string) {
  if (duration === 'Less than 2 weeks') {
    return 'You’re catching this early — that’s a smart move.';
  }
  if (duration === '2–4 weeks') {
    return 'Acting quickly gives you a real advantage.';
  }
  if (duration === '1 to 3 months') {
    return 'That’s more common than you think.';
  }
  return 'It’s never too late to start feeling better.';
}

export function tinglingCareLine() {
  return 'I’ll flag that for your therapist.';
}

export function intensityAnswer(value: number) {
  return `${value} / 10`;
}

export function chatIntro(
  door: DoorId,
  answers: Answers,
): { from: 'Phoenix' | 'Lauren'; text: string }[] {
  const area = answers.area ?? 'that pain';
  const duration = (answers.duration ?? 'a while').toLowerCase();
  const intensity = answers.intensity ?? 5;
  const tingling = answers.tingling;

  if (door === 'assessment') {
    const tinglingBit =
      tingling === true
        ? ', with some tingling down the arm'
        : tingling === false
          ? ', no tingling'
          : '';
    return [
      {
        from: 'Phoenix',
        text: `${MEMBER} — ${area.toLowerCase()}, ${duration}, around a ${intensity}${tinglingBit}. I’ll set up an assessment around that.`,
      },
      {
        from: 'Lauren',
        text: 'I’ll take a look before we start. You’re in good hands.',
      },
    ];
  }

  if (door === 'how') {
    return [
      {
        from: 'Phoenix',
        text: `This thread is us — you, me, and ${PT}. Sessions, questions, check-ins. All here.`,
      },
    ];
  }

  return [
    {
      from: 'Phoenix',
      text: `Go ahead. I’m here, and ${PT} can jump in whenever you need her.`,
    },
  ];
}
