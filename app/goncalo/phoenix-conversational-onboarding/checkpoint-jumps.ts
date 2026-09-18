import type { PhoenixMood } from './phoenix-orb';
import type { PhoenixStep } from './phoenix-scene';
import {
  activityCareLine,
  activityIntroLine,
  activityLabel,
  activityQuestion,
  areaQuestion,
  completeCondition,
  conditionWrapLine,
  currentArea,
  doorLabel,
  durationCareLine,
  durationQuestion,
  flagsCareLine,
  flagsQuestion,
  GUIDE_LINES,
  impactCareLine,
  impactQuestion,
  intensityAnswer,
  intensityCareLine,
  intensityQuestion,
  MORE_NO_LABEL,
  moreQuestion,
  READY_LABEL,
  regionAnswer,
  regionQuestion,
  SAFETY_FLAGS,
  SAFETY_NONE_LABEL,
  safetyLine,
  placementIntroLine,
  sessionIntroLine,
  START_SESSION_LABEL,
  type ActivityId,
  type Answers,
  type DoorId,
  type StackTurn,
} from './script';

type Phase = 'entering' | 'phoenix' | 'exiting' | 'chat';

export type JumpDestinationId =
  | 'intro'
  | 'ready'
  | 'area'
  | 'activity'
  | 'session'
  | 'assess'
  | 'reward'
  | 'commitment'
  | 'flags';

export interface JumpDestination {
  id: JumpDestinationId;
  label: string;
  shortcut: string;
}

export const JUMP_DESTINATIONS: JumpDestination[] = [
  { id: 'intro', label: 'Intro', shortcut: '1' },
  { id: 'ready', label: 'Ready', shortcut: '2' },
  { id: 'area', label: 'Area', shortcut: '3' },
  { id: 'activity', label: 'Activity', shortcut: '4' },
  { id: 'session', label: 'Session', shortcut: '5' },
  { id: 'assess', label: 'Assess', shortcut: '6' },
  { id: 'reward', label: 'Reward', shortcut: '8' },
  { id: 'commitment', label: 'Commitment', shortcut: '9' },
  { id: 'flags', label: 'Flags', shortcut: '7' },
];

export interface JumpCheckpoint {
  key: string;
  label: string;
  phase: Phase;
  step: PhoenixStep;
  answers: Answers;
  turns: StackTurn[];
  mood: PhoenixMood;
  door: DoorId | null;
  chatCount: number;
  sessionAfterReward: boolean;
  answerTurnId?: string;
}

export interface JumpState {
  checkpoints: JumpCheckpoint[];
  targetIndex: number;
  streamedTurnIds: string[];
  phase: Phase;
  step: PhoenixStep;
  answers: Answers;
  turns: StackTurn[];
  mood: PhoenixMood;
  door: DoorId | null;
  chatCount: number;
  isHero: boolean;
  panelLayoutReady: boolean;
  cameraContentReady: boolean;
  offerContentReady: boolean;
  safetyContentReady: boolean;
  confirmContentReady: boolean;
}

const DEMO_AREA = 'Shoulder';
const DEMO_DURATION = '2–4 weeks ago';
const DEMO_INTENSITY = 7;
const DEMO_ACTIVITY: ActivityId = 'moderate';
const DEMO_REGIONS = ['Shoulder blade', 'Upper arm'];
const DEMO_IMPACTS = ['Carrying a bag or groceries'];

const PANEL_HEADING_IDS = {
  camera: 'camera-heading',
  offer: 'offer-heading',
  safety: 'safety-heading',
  schedule: 'schedule-heading',
  confirm: 'confirm-heading',
} as const;

const EMPTY_ANSWERS: Answers = {
  area: null,
  duration: null,
  intensity: null,
  tingling: null,
  regions: [],
  impacts: [],
  completed: [],
  activity: null,
  safetyFlags: [],
  appointmentDay: null,
  appointmentTime: null,
};

function cloneAnswers(answers: Answers): Answers {
  return {
    ...answers,
    completed: answers.completed.map((condition) => ({
      ...condition,
      regions: [...(condition.regions ?? [])],
      impacts: [...(condition.impacts ?? [])],
    })),
    regions: [...(answers.regions ?? [])],
    impacts: [...(answers.impacts ?? [])],
    safetyFlags: [...answers.safetyFlags],
  };
}

function checkpointKey(phase: Phase, step: PhoenixStep, turnCount: number) {
  if (phase === 'chat' || phase === 'exiting') return `chat:${turnCount}`;
  if (step.kind === 'know') return `know:${step.index}:${turnCount}`;
  return `${step.kind}:${turnCount}`;
}

function checkpointLabel(
  phase: Phase,
  step: PhoenixStep,
  answers: Answers,
  door: DoorId | null,
) {
  if (phase === 'chat' || phase === 'exiting') {
    return door ? doorLabel(door) : 'Chat';
  }
  if (step.kind === 'ready') return 'Ready';
  if (step.kind === 'more') {
    return answers.area ? `More · ${answers.area}` : 'More';
  }
  if (step.kind === 'activity') return 'Activity';
  if (step.kind === 'session') return 'Session';
  if (step.kind === 'camera') return 'Camera';
  if (step.kind === 'offer') return 'Session';
  if (step.kind === 'safety') return 'Safety';
  if (step.kind === 'placement-intro') return 'Setup';
  if (step.kind === 'placement') return 'Placement';
  if (step.kind === 'exercise') return 'Exercise';
  if (step.kind === 'reward-reveal') return 'Reward';
  if (step.kind === 'reward-shipping') return 'Shipping';
  if (step.kind === 'reward-confirmation') return 'Reward sent';
  if (step.kind === 'reward-commitment') return 'Commitment';
  if (step.kind === 'call') return 'Call';
  if (step.kind === 'schedule') return 'Schedule';
  if (step.kind === 'confirm') return 'Confirm';
  if (step.kind === 'remind') return 'Remind';
  if (step.kind === 'region') {
    return answers.area ? `Region · ${answers.area}` : 'Region';
  }
  if (step.kind === 'impact') {
    return answers.area ? `Impact · ${answers.area}` : 'Impact';
  }
  if (step.kind === 'know') {
    const round = answers.completed.length + 1;
    const suffix = round > 1 ? ` ${round}` : '';
    if (step.index === 0) return `Area${suffix}`;
    if (step.index === 1) {
      return answers.area ? `Duration · ${answers.area}` : 'Duration';
    }
    if (step.index === 2) {
      return answers.area ? `Intensity · ${answers.area}` : 'Intensity';
    }
    return answers.area ? `Follow-up · ${answers.area}` : 'Follow-up';
  }
  return 'Question';
}

function makeCheckpoint(
  nextPhase: Phase,
  nextStep: PhoenixStep,
  nextAnswers: Answers,
  nextTurns: StackTurn[],
  nextMood: PhoenixMood,
  nextDoor: DoorId | null,
  nextChatCount: number,
  nextSessionAfterReward = false,
): JumpCheckpoint {
  return {
    key: checkpointKey(nextPhase, nextStep, nextTurns.length),
    label: checkpointLabel(nextPhase, nextStep, nextAnswers, nextDoor),
    phase: nextPhase,
    step: { ...nextStep },
    answers: cloneAnswers(nextAnswers),
    turns: [...nextTurns],
    mood: nextMood,
    door: nextDoor,
    chatCount: nextChatCount,
    sessionAfterReward: nextSessionAfterReward,
  };
}

function demoIntakeAnswers(): Answers {
  return completeCondition({
    area: DEMO_AREA,
    duration: DEMO_DURATION,
    intensity: DEMO_INTENSITY,
    tingling: null,
    regions: [...DEMO_REGIONS],
    impacts: [...DEMO_IMPACTS],
    completed: [],
    activity: null,
    safetyFlags: [],
    appointmentDay: null,
    appointmentTime: null,
  });
}

function demoActivityAnswers(): Answers {
  return { ...demoIntakeAnswers(), activity: DEMO_ACTIVITY };
}

function demoFlagAnswers(): Answers {
  return {
    ...demoActivityAnswers(),
    safetyFlags: [SAFETY_FLAGS[0]],
  };
}

class TurnBuilder {
  turns: StackTurn[] = [];
  checkpoints: JumpCheckpoint[] = [];

  constructor(private nextTurnId: () => string) {}

  phoenix(text: string, kind: StackTurn['kind'] = 'question') {
    this.turns.push({
      id: this.nextTurnId(),
      role: 'phoenix',
      text,
      kind,
    });
    return this;
  }

  member(text: string) {
    const id = this.nextTurnId();
    const asked = this.checkpoints.at(-1);
    if (asked && !asked.answerTurnId) asked.answerTurnId = id;
    this.turns.push({ id, role: 'member', text, kind: 'answer' });
    return this;
  }

  /** Snapshot the state a question was asked in, so the member can return to it. */
  mark(step: PhoenixStep, answers: Answers, mood: PhoenixMood = 'listen') {
    this.checkpoints.push(
      makeCheckpoint('phoenix', step, answers, this.turns, mood, null, 0),
    );
    return this;
  }

  snapshot() {
    return [...this.turns];
  }
}

function buildGuideTurns(nextTurnId: () => string) {
  return GUIDE_LINES.map((text, index) => ({
    id: nextTurnId(),
    role: 'phoenix' as const,
    text,
    kind: (index < 3 ? 'guide' : 'question') as StackTurn['kind'],
  }));
}

function intakeAnswerStages() {
  const area = { ...EMPTY_ANSWERS, area: DEMO_AREA };
  const regions = { ...area, regions: [...DEMO_REGIONS] };
  const duration = { ...regions, duration: DEMO_DURATION };
  const intensity = { ...duration, intensity: DEMO_INTENSITY };
  const impacts = { ...intensity, impacts: [...DEMO_IMPACTS] };
  return { area, regions, duration, intensity, impacts };
}

function buildIntakeTimeline(builder: TurnBuilder) {
  const stage = intakeAnswerStages();

  GUIDE_LINES.forEach((text, index) => {
    builder.phoenix(text, index < 3 ? 'guide' : 'question');
    if (index === 0) {
      builder.mark({ kind: 'guide', index: 0 }, EMPTY_ANSWERS, 'speak');
    }
  });
  builder.mark({ kind: 'ready' }, EMPTY_ANSWERS);

  builder.member(READY_LABEL).phoenix(areaQuestion(0));
  builder.mark({ kind: 'know', index: 0 }, EMPTY_ANSWERS);

  builder.member(DEMO_AREA).phoenix(regionQuestion(DEMO_AREA));
  builder.mark({ kind: 'region' }, stage.area);

  builder
    .member(regionAnswer(DEMO_REGIONS))
    .phoenix(durationQuestion(DEMO_AREA));
  builder.mark({ kind: 'know', index: 1 }, stage.regions);

  builder
    .member(DEMO_DURATION)
    .phoenix(durationCareLine(DEMO_DURATION), 'care')
    .phoenix(intensityQuestion());
  builder.mark({ kind: 'know', index: 2 }, stage.duration);

  builder
    .member(intensityAnswer(DEMO_INTENSITY))
    .phoenix(intensityCareLine(DEMO_INTENSITY), 'care')
    .phoenix(impactQuestion());
  builder.mark({ kind: 'impact' }, stage.intensity);

  builder
    .member(regionAnswer(DEMO_IMPACTS))
    .phoenix(impactCareLine(), 'care')
    .phoenix(conditionWrapLine(DEMO_AREA), 'care')
    .phoenix(moreQuestion());
  builder.mark({ kind: 'more' }, stage.impacts);

  builder
    .member(MORE_NO_LABEL)
    .phoenix(activityIntroLine(), 'care')
    .phoenix(activityQuestion());
  builder.mark({ kind: 'activity' }, demoIntakeAnswers());

  return builder;
}

function streamedIdsForTurns(
  turns: StackTurn[],
  step: PhoenixStep,
  flags: {
    cameraContentReady: boolean;
    offerContentReady: boolean;
    safetyContentReady: boolean;
    confirmContentReady: boolean;
    panelLayoutReady: boolean;
  },
) {
  const ids = turns.map((turn) => turn.id);
  if (flags.cameraContentReady) ids.push(PANEL_HEADING_IDS.camera);
  if (flags.offerContentReady) ids.push(PANEL_HEADING_IDS.offer);
  if (flags.safetyContentReady) ids.push(PANEL_HEADING_IDS.safety);
  if (flags.confirmContentReady) ids.push(PANEL_HEADING_IDS.confirm);
  if (flags.panelLayoutReady && step.kind === 'schedule') {
    ids.push(PANEL_HEADING_IDS.schedule);
  }
  return ids;
}

function finishJump(
  destinationId: JumpDestinationId,
  checkpoints: JumpCheckpoint[],
  targetIndex: number,
  turns: StackTurn[],
  answers: Answers,
  phase: Phase,
  step: PhoenixStep,
  mood: PhoenixMood,
  door: DoorId | null,
  chatCount: number,
  flags: {
    isHero: boolean;
    panelLayoutReady: boolean;
    cameraContentReady: boolean;
    offerContentReady: boolean;
    safetyContentReady: boolean;
    confirmContentReady: boolean;
  },
): JumpState {
  return {
    checkpoints,
    targetIndex,
    streamedTurnIds: streamedIdsForTurns(turns, step, flags),
    phase,
    step,
    answers: cloneAnswers(answers),
    turns,
    mood,
    door,
    chatCount,
    ...flags,
  };
}

export function buildJumpState(
  destinationId: JumpDestinationId,
  nextTurnId: () => string,
): JumpState {
  const checkpoints: JumpCheckpoint[] = [];

  if (destinationId === 'intro') {
    const turns = [
      {
        id: nextTurnId(),
        role: 'phoenix' as const,
        text: GUIDE_LINES[0],
        kind: 'guide' as const,
      },
    ];
    checkpoints.push(
      makeCheckpoint(
        'phoenix',
        { kind: 'guide', index: 0 },
        EMPTY_ANSWERS,
        turns,
        'speak',
        null,
        0,
      ),
    );
    return finishJump(
      destinationId,
      checkpoints,
      0,
      turns,
      EMPTY_ANSWERS,
      'phoenix',
      { kind: 'guide', index: 0 },
      'speak',
      null,
      0,
      {
        isHero: true,
        panelLayoutReady: false,
        cameraContentReady: false,
        offerContentReady: false,
        safetyContentReady: false,
        confirmContentReady: false,
      },
    );
  }

  if (destinationId === 'ready') {
    const turns = buildGuideTurns(nextTurnId);
    const readyStep: PhoenixStep = { kind: 'ready' };
    checkpoints.push(
      makeCheckpoint(
        'phoenix',
        { kind: 'guide', index: 0 },
        EMPTY_ANSWERS,
        [turns[0]],
        'speak',
        null,
        0,
      ),
    );
    checkpoints.push(
      makeCheckpoint(
        'phoenix',
        readyStep,
        EMPTY_ANSWERS,
        turns,
        'listen',
        null,
        0,
      ),
    );
    return finishJump(
      destinationId,
      checkpoints,
      1,
      turns,
      EMPTY_ANSWERS,
      'phoenix',
      readyStep,
      'listen',
      null,
      0,
      {
        isHero: true,
        panelLayoutReady: false,
        cameraContentReady: false,
        offerContentReady: false,
        safetyContentReady: false,
        confirmContentReady: false,
      },
    );
  }

  if (destinationId === 'area') {
    const guideTurns = buildGuideTurns(nextTurnId);
    const readyTurns = [...guideTurns];
    const areaTurns = [
      ...readyTurns,
      {
        id: nextTurnId(),
        role: 'member' as const,
        text: READY_LABEL,
        kind: 'answer' as const,
      },
      {
        id: nextTurnId(),
        role: 'phoenix' as const,
        text: areaQuestion(0),
        kind: 'question' as const,
      },
    ];
    const readyStep: PhoenixStep = { kind: 'ready' };
    const areaStep: PhoenixStep = { kind: 'know', index: 0 };
    checkpoints.push(
      makeCheckpoint(
        'phoenix',
        { kind: 'guide', index: 0 },
        EMPTY_ANSWERS,
        [guideTurns[0]],
        'speak',
        null,
        0,
      ),
    );
    checkpoints.push(
      makeCheckpoint(
        'phoenix',
        readyStep,
        EMPTY_ANSWERS,
        readyTurns,
        'listen',
        null,
        0,
      ),
    );
    checkpoints.push(
      makeCheckpoint(
        'phoenix',
        areaStep,
        EMPTY_ANSWERS,
        areaTurns,
        'listen',
        null,
        0,
      ),
    );
    return finishJump(
      destinationId,
      checkpoints,
      2,
      areaTurns,
      EMPTY_ANSWERS,
      'phoenix',
      areaStep,
      'listen',
      null,
      0,
      {
        isHero: true,
        panelLayoutReady: false,
        cameraContentReady: false,
        offerContentReady: false,
        safetyContentReady: false,
        confirmContentReady: false,
      },
    );
  }

  const builder = new TurnBuilder(nextTurnId);
  buildIntakeTimeline(builder);
  const intakeAnswers = demoIntakeAnswers();
  const baseFlags = {
    isHero: true,
    panelLayoutReady: false,
    cameraContentReady: false,
    offerContentReady: false,
    safetyContentReady: false,
    confirmContentReady: false,
  };

  function finishAt(
    step: PhoenixStep,
    answers: Answers,
    mood: PhoenixMood,
    flags: Partial<typeof baseFlags> = {},
  ) {
    return finishJump(
      destinationId,
      builder.checkpoints,
      builder.checkpoints.length - 1,
      builder.snapshot(),
      answers,
      'phoenix',
      step,
      mood,
      null,
      0,
      { ...baseFlags, ...flags },
    );
  }

  if (destinationId === 'activity') {
    return finishAt({ kind: 'activity' }, intakeAnswers, 'listen');
  }

  const activityAnswers = demoActivityAnswers();
  builder
    .member(activityLabel(DEMO_ACTIVITY))
    .phoenix(activityCareLine(DEMO_ACTIVITY), 'care')
    .phoenix(sessionIntroLine(currentArea(intakeAnswers)));
  builder.mark({ kind: 'offer' }, activityAnswers);

  if (destinationId === 'session') {
    return finishAt({ kind: 'offer' }, activityAnswers, 'listen', {
      offerContentReady: true,
    });
  }

  builder.member(START_SESSION_LABEL).phoenix(safetyLine());
  builder.mark({ kind: 'safety' }, activityAnswers);

  if (destinationId === 'flags') {
    const flagAnswers = demoFlagAnswers();
    builder.phoenix(flagsCareLine(), 'care').phoenix(flagsQuestion());
    builder.mark({ kind: 'call' }, flagAnswers);
    return finishAt({ kind: 'call' }, flagAnswers, 'listen', {
      offerContentReady: true,
      safetyContentReady: true,
    });
  }

  builder.member(SAFETY_NONE_LABEL).phoenix(placementIntroLine());

  if (destinationId === 'assess') {
    builder.mark({ kind: 'placement-intro' }, activityAnswers);
    builder.mark({ kind: 'camera' }, activityAnswers);
    builder.mark({ kind: 'placement' }, activityAnswers);
    return finishAt({ kind: 'placement' }, activityAnswers, 'listen', {
      offerContentReady: true,
      safetyContentReady: true,
    });
  }

  builder.mark({ kind: 'exercise' }, activityAnswers);
  builder.mark({ kind: 'reward-reveal' }, activityAnswers);

  if (destinationId === 'reward') {
    return finishAt({ kind: 'reward-reveal' }, activityAnswers, 'listen', {
      offerContentReady: true,
      safetyContentReady: true,
    });
  }

  builder.mark({ kind: 'reward-commitment' }, activityAnswers, 'breath');
  return finishAt({ kind: 'reward-commitment' }, activityAnswers, 'breath', {
    offerContentReady: true,
    safetyContentReady: true,
  });
}

export function jumpDestinationForShortcut(key: string) {
  return JUMP_DESTINATIONS.find((destination) => destination.shortcut === key);
}
