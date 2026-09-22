export const MEMBER = 'Ashley';
export const PT = 'Lauren';

export const BODY_AREAS = [
  'Neck',
  'Shoulder',
  'Elbow',
  'Wrist/Hand',
  'Back',
  'Hip',
  'Knee',
  'Ankle',
] as const;

export type BodyArea = (typeof BODY_AREAS)[number];

export const AREA_REGIONS: Record<BodyArea, readonly string[]> = {
  Neck: ['Base of skull', 'Side of neck', 'Front of neck'],
  Shoulder: ['Upper chest', 'Shoulder blade', 'Upper arm'],
  Elbow: ['Inner elbow', 'Outer elbow', 'Forearm'],
  'Wrist/Hand': ['Wrist', 'Palm', 'Fingers'],
  Back: ['Upper back', 'Mid-back', 'Lower back'],
  Hip: ['Front of hip', 'Side of hip', 'Buttock'],
  Knee: ['Front of knee', 'Inner knee', 'Back of knee'],
  Ankle: ['Inner ankle', 'Outer ankle', 'Top of foot'],
};

export const AREA_IMPACTS: Record<BodyArea, readonly string[]> = {
  Neck: [
    'Looking over your shoulder',
    'Working at a computer',
    'Sleeping through the night',
    'Carrying a bag',
    'Turning your head quickly',
  ],
  Shoulder: [
    'Reaching overhead',
    'Carrying a bag or groceries',
    'Lying comfortably on that side',
    'Doing recreational activities',
    'Using both arms equally',
  ],
  Elbow: [
    'Lifting everyday objects',
    'Rotating your forearm',
    'Carrying a bag',
    'Doing recreational activities',
    'Straightening your arm fully',
  ],
  'Wrist/Hand': [
    'Gripping or opening jars',
    'Typing or using a phone',
    'Carrying a bag',
    'Doing recreational activities',
    'Twisting a doorknob',
  ],
  Back: [
    'Bending forward',
    'Sitting for long periods',
    'Getting out of bed',
    'Doing recreational activities',
    'Standing up from a chair',
  ],
  Hip: [
    'Walking longer distances',
    'Going up stairs',
    'Putting on shoes',
    'Doing recreational activities',
    'Lying on that side',
  ],
  Knee: [
    'Going up or down stairs',
    'Squatting or sitting low',
    'Walking longer distances',
    'Doing recreational activities',
    'Getting up from a chair',
  ],
  Ankle: [
    'Walking on uneven ground',
    'Going up or down stairs',
    'Standing for long periods',
    'Doing recreational activities',
    'Pushing off when you walk',
  ],
};

export const DURATIONS = [
  'Less than 2 weeks ago',
  '2–4 weeks ago',
  '1–3 months ago',
  'More than 3 months ago',
] as const;

export const IMPACT_MAX = 2;
export const IMPACT_NONE_LABEL = 'None of the above';

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
  'Fever or feeling unwell',
  'Pregnancy',
];

export const SAFETY_NONE_LABEL = 'None of the above';

export const START_SESSION_LABEL = "I'm ready";
export const ENABLE_CAMERA_LABEL = 'Continue';
export const LATER_LABEL = 'I can’t right now';
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
  'I’ll be guiding your care, alongside a dedicated physical therapist.',
  'Let’s start with a few questions to understand what you’re feeling.',
  'It takes about 2 minutes. Ready?',
] as const;

export const DISCLAIMER = 'Your answers are confidential and won’t be shared';

export const READY_LABEL = 'I’m ready';

export const THERAPIST_PHRASE = 'physical therapist';

export const MAX_BODY_AREAS = 3;

export const MORE_YES_LABEL = 'Yes, I have pain somewhere else';
export const MORE_NO_LABEL = 'No, that’s all';
export const MORE_HINT = 'You can choose up to 3 body areas';

export type Condition = {
  area: string;
  duration: string;
  intensity: number;
  tingling: boolean | null;
  regions: string[];
  impacts: string[];
};

export type Answers = {
  area: string | null;
  duration: string | null;
  intensity: number | null;
  tingling: boolean | null;
  regions: string[];
  impacts: string[];
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
  if (completedCount > 0) return 'Where else do you feel pain?';
  return 'Where do you feel pain?';
}

export function regionQuestion(area: string) {
  return `Where does it hurt the most in your ${area.toLowerCase()}?`;
}

export function regionAnswer(regions: string[]) {
  if (regions.length === 0) return '';
  if (regions.length === 1) return regions[0];
  const rest = regions.slice(1).map((item) => {
    const [first, ...tail] = item;
    return `${first.toLowerCase()}${tail.join('')}`;
  });
  if (rest.length === 1) return `${regions[0]} and ${rest[0]}`;
  return `${regions[0]}, ${rest.slice(0, -1).join(', ')}, and ${rest.at(-1)}`;
}

export function impactAnswer(impacts: string[]) {
  return impacts.join(', ');
}

export function regionsFor(area: string | null) {
  if (!area) return [];
  return AREA_REGIONS[area as BodyArea] ?? [];
}

export function impactsFor(area: string | null) {
  if (!area) return [];
  return AREA_IMPACTS[area as BodyArea] ?? [];
}

export function moreQuestion(_area?: string) {
  return 'Anywhere else hurting right now?';
}

export function conditionWrapLine(area: string) {
  return `That’s all about your ${area.toLowerCase()} for now.`;
}

export function impactQuestion() {
  return 'Which of these are you struggling with most?';
}

export function impactHint() {
  return 'Select up to 2 options that you find most disruptive to your life.';
}

export function impactCareLine() {
  return 'We’ll make sure your exercises help you get back to these tasks.';
}

export function activityIntroLine() {
  return 'Perfect, I have just a couple more questions for you.';
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
  return `Now, let’s check how your ${area.toLowerCase()} is moving with a few quick exercises.`;
}

export function cameraLine() {
  return 'We’ll use your camera to guide each movement and give you real-time feedback.';
}

export const CAMERA_PRIVACY =
  'We never record, save, or store video. Your data remains private.';

export function offerLine() {
  return 'Let’s start your first session.';
}

export function kitTeaserLine() {
  return 'Once you’re done, you’ll receive your welcome kit.';
}

export function kitTeaserHint() {
  return 'It includes all the equipment you need to help you progress through your program.';
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

export function placementIntroLine() {
  return "Great. Let's get you set up for your first session.";
}

export function callCareLine() {
  return 'No problem, it might not be the best time for you.';
}

export function callQuestion() {
  return 'In the meantime, would you like to schedule a quick call with our team?';
}

export function flagsCareLine() {
  return 'Thanks for letting us know.';
}

export function flagsQuestion() {
  return 'Your program will be adapted to make sure you can perform it safely.';
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

export function durationQuestion(area?: string) {
  if (!area) return 'When did it start?';
  return `When did you first start feeling pain in your ${area.toLowerCase()}?`;
}

export function intensityQuestion() {
  return 'How intense has your pain been lately?';
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
        regions: [...(answers.regions ?? [])],
        impacts: [...(answers.impacts ?? [])],
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
    regions: [],
    impacts: [],
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
  if (duration.startsWith('Less than 2 weeks')) {
    return 'You’re catching this early — that’s a smart move.';
  }
  if (duration.startsWith('2–4 weeks')) {
    return 'Acting quickly gives you a real advantage.';
  }
  if (duration.startsWith('1–3 months')) {
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

export function intensityAnswer(value: number) {
  return `${value}/10`;
}

export function chatIntro(
  door: DoorId,
  answers: Answers,
  options?: { afterReward?: boolean },
): { from: 'Phoenix' | 'Lauren'; text: string }[] {
  const area = answers.area ?? answers.completed.at(-1)?.area ?? 'that';

  if (door === 'session') {
    if (options?.afterReward) {
      return [
        {
          from: 'Lauren',
          text: 'I’ll review this and we’ll use it in your program.',
        },
      ];
    }

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
