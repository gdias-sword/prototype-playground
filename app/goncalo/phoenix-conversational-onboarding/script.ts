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
  '1–3 months',
  'More than 3 months',
] as const;

export type DoorId = 'session' | 'scheduled' | 'later';

export const SPECIALIST = 'Jessica';
export const SPECIALIST_FULL = 'Dr. Jessica Miller';

export type ActivityId = 'low' | 'moderate' | 'high';

export const ACTIVITIES: {
  id: ActivityId;
  label: string;
  hint: string;
}[] = [
  {
    id: 'low',
    label: 'Not very active',
    hint: 'Mostly sitting, with light daily movement',
  },
  {
    id: 'moderate',
    label: 'Moderately active',
    hint: 'Some intentional movement most days',
  },
  {
    id: 'high',
    label: 'Very active',
    hint: 'Exercise or sport most days',
  },
];

export const SAFETY_FLAGS = [
  'Dizziness or balance issues',
  'Surgery in the last 3 months',
  'Chest pain or shortness of breath',
  'Numbness or tingling',
  'Fever or feeling unwell',
  'Pregnancy',
];

export const SAFETY_NONE_LABEL = 'None of the above';

export const START_SESSION_LABEL = "I'm ready";
export const LATER_LABEL = 'I’ll do it later';
export const CALL_YES_LABEL = 'Yes, let’s talk';
export const CALL_NO_LABEL = 'Not right now';
export const REMIND_YES_LABEL = 'Yes, remind me';
export const REMIND_NO_LABEL = 'I don’t want a reminder';

export type ScheduleDay = {
  date: number;
  weekday: string;
  available: boolean;
};

export const SCHEDULE_MONTH = 'August 2026';
export const SCHEDULE_DAYS: ScheduleDay[] = [
  { date: 24, weekday: 'Mon', available: true },
  { date: 25, weekday: 'Tue', available: true },
  { date: 26, weekday: 'Wed', available: true },
  { date: 27, weekday: 'Thu', available: true },
  { date: 28, weekday: 'Fri', available: true },
  { date: 29, weekday: 'Sat', available: false },
];
export const SCHEDULE_TIMES_BY_DATE: Record<number, string[]> = {
  24: [
    '9:00 AM',
    '9:15 AM',
    '9:30 AM',
    '9:45 AM',
    '10:00 AM',
    '1:15 PM',
    '3:45 PM',
    '5:00 PM',
  ],
  25: ['11:00 AM', '1:00 PM', '2:30 PM', '4:15 PM'],
  26: ['8:30 AM', '10:00 AM', '10:30 AM', '2:00 PM', '3:15 PM', '4:45 PM'],
  27: ['9:00 AM', '12:00 PM', '3:00 PM'],
  28: ['10:15 AM', '11:00 AM', '11:45 AM', '4:00 PM', '5:30 PM'],
};

export function scheduleTimesForDay(day: ScheduleDay) {
  if (!day.available) return [];
  return SCHEDULE_TIMES_BY_DATE[day.date] ?? [];
}

export const SCHEDULE_ZONE = 'Eastern Standard Time (EST)';

export const GUIDE_LINES = [
  `Hi ${MEMBER}, I’m Phoenix.`,
  `I’ll be guiding your care, alongside ${PT}, your physical therapist.`,
  'Let’s start with a few questions to understand what you’re feeling.',
  'It takes about 2 minutes. Ready?',
] as const;

export const DISCLAIMER =
  'Your answers are confidential and won’t be shared';

export const READY_LABEL = 'I’m ready';

export const THERAPIST_PHRASE = PT;

export const MAX_BODY_AREAS = 3;

export const MORE_YES_LABEL = 'Yes, I want to treat another area';
export const MORE_NO_LABEL = 'No, that’s everything';
export const MORE_HINT = 'You can choose up to 3 body areas';

export type Condition = {
  area: string;
  duration: string;
  intensity: number;
  tingling: boolean | null;
};

export type Answers = {
  area: string | null;
  duration: string | null;
  intensity: number | null;
  tingling: boolean | null;
  completed: Condition[];
  activity: ActivityId | null;
  safetyFlags: string[];
  appointmentDay: string | null;
  appointmentTime: string | null;
};

export type StackTurn = {
  id: string;
  role: 'phoenix' | 'member';
  text: string;
  kind: 'guide' | 'question' | 'care' | 'answer';
};

export function areaQuestion(completedCount = 0) {
  if (completedCount > 0) return 'Where else is bothering you?';
  return 'Where are you feeling pain or symptoms?';
}

export function moreQuestion(area: string) {
  return `That’s everything we need to know about your ${area.toLowerCase()} pain. Anywhere else bothering you?`;
}

export function activityIntroLine() {
  return 'Great! Before we start, I want to make sure your session fits your activity level.';
}

export function activityQuestion() {
  return 'How active have you been lately?';
}

export function activityCareLine(activity: ActivityId) {
  if (activity === 'low') {
    return 'We’ll keep this gentle and build from where you are.';
  }
  if (activity === 'high') {
    return 'We’ll use that energy — and still keep every movement safe.';
  }
  return 'Sounds like you’ve got a good foundation. We’ll work with that.';
}

export function sessionIntroLine(area: string) {
  return `Now let’s get into your first session. We’ll start with a quick ${area.toLowerCase()} check-up.`;
}

export function cameraLine() {
  return 'We’ll use your camera to follow your movements and give you feedback in real time.';
}

export function offerLine() {
  return 'Takes just a few minutes. Ready to start?';
}

export function checkupTitle(area: string) {
  return `${area} Check-up`;
}

export function currentArea(answers: Answers) {
  return answers.area ?? answers.completed.at(-1)?.area ?? 'Shoulder';
}

export function activityLabel(id: ActivityId) {
  return ACTIVITIES.find((activity) => activity.id === id)?.label ?? id;
}

export function doorLabel(door: DoorId) {
  if (door === 'session') return 'First session';
  if (door === 'scheduled') return 'Call booked';
  return 'Later';
}

export function safetyLine() {
  return 'Before we start, just a quick safety check';
}

export function safetyHint() {
  return 'Select any that apply.';
}

export function callCareLine() {
  return 'No problem, it might not be the best time for you.';
}

export function callQuestion() {
  return 'In the meantime, would you like to schedule a quick call with our team?';
}

export function flagsCareLine() {
  return 'Thanks for letting me know.';
}

export function flagsQuestion() {
  return 'A couple of things came up, so we think it’s best to start with a quick call.';
}

export function scheduleLine() {
  return 'Let’s schedule your call';
}

export function confirmLine() {
  return `You’ll be speaking with\n${SPECIALIST}`;
}

export function remindQuestion() {
  return 'No worries. Do you want me to remind you about your session later instead?';
}

export function durationQuestion() {
  return 'When did it start?';
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

export function completeCondition(answers: Answers): Answers {
  if (!answers.area || !answers.duration || answers.intensity == null) {
    return answers;
  }

  return {
    ...answers,
    completed: [
      ...answers.completed,
      {
        area: answers.area,
        duration: answers.duration,
        intensity: answers.intensity,
        tingling: answers.tingling,
      },
    ],
  };
}

export function startNextCondition(answers: Answers): Answers {
  return {
    area: null,
    duration: null,
    intensity: null,
    tingling: null,
    completed: answers.completed,
    activity: answers.activity,
    safetyFlags: answers.safetyFlags,
    appointmentDay: answers.appointmentDay,
    appointmentTime: answers.appointmentTime,
  };
}

export function weekdayLong(weekday: string) {
  if (weekday === 'Mon') return 'Monday';
  if (weekday === 'Tue') return 'Tuesday';
  if (weekday === 'Wed') return 'Wednesday';
  if (weekday === 'Thu') return 'Thursday';
  if (weekday === 'Fri') return 'Friday';
  return 'Saturday';
}

export function appointmentDayLabel(day: ScheduleDay) {
  return `${weekdayLong(day.weekday)}, August ${day.date}, 2026`;
}

export function selectedAreas(answers: Answers) {
  return answers.completed.map((condition) => condition.area);
}

export function durationCareLine(duration: string) {
  if (duration === 'Less than 2 weeks') {
    return 'You’re catching this early — that’s a smart move.';
  }
  if (duration === '2–4 weeks') {
    return 'Acting quickly gives you a real advantage.';
  }
  if (duration === '1–3 months') {
    return 'That’s more common than you think.';
  }
  return 'It’s never too late to start feeling better.';
}

export function intensityCareLine(value: number) {
  if (value <= 3) {
    return 'This is a great window to get ahead of it.';
  }
  if (value <= 5) {
    return 'Noticeable, but workable — we’ll pace it with you.';
  }
  if (value <= 8) {
    return 'We’ll start things slow and keep every movement gentle.';
  }
  return 'That’s a lot — we’ll stay well within what feels safe.';
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
  const area = answers.area ?? answers.completed.at(-1)?.area ?? 'that';

  if (door === 'session') {
    return [
      {
        from: 'Phoenix',
        text: `Nice work — I captured your ${area.toLowerCase()} movement.`,
      },
      {
        from: 'Lauren',
        text: 'I’ll review this and we’ll use it in your program.',
      },
    ];
  }

  if (door === 'scheduled') {
    const when = answers.appointmentDay
      ? `${answers.appointmentDay} at ${answers.appointmentTime}`
      : 'your selected time';
    return [
      {
        from: 'Phoenix',
        text: `You’re all set, ${MEMBER}!`,
      },
      {
        from: 'Phoenix',
        text: `Your intake call has been booked for ${when} with ${SPECIALIST_FULL}.`,
      },
    ];
  }

  return [
    {
      from: 'Phoenix',
      text: `I’ll be here when you’re ready for your ${area.toLowerCase()} check-up.`,
    },
    {
      from: 'Lauren',
      text: 'No rush — we’ll pick it up whenever you are.',
    },
  ];
}
