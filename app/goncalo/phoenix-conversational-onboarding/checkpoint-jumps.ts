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
  flagsAdaptLine,
  cameraLine,
  flagsCareLine,
  GUIDE_LINES,
  impactAnswer,
  impactCareLine,
  impactQuestion,
  intensityAnswer,
  intensityCareLine,
  intensityQuestion,
  kitTeaserLine,
  MORE_NO_LABEL,
  moreQuestion,
  offerLine,
  READY_LABEL,
  regionAnswer,
  regionQuestion,
  SAFETY_FLAGS,
  SAFETY_NONE_LABEL,
  safetyLine,
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
  | 'flags'
  | 'pt'
  | 'chat-intro'
  | 'notify';

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
  { id: 'flags', label: 'Flags', shortcut: '7' },
  { id: 'pt', label: 'PT reveal', shortcut: '9' },
  { id: 'chat-intro', label: 'Care team', shortcut: '0' },
  { id: 'notify', label: 'Notify', shortcut: 'n' },
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
}

const DEMO_AREA = 'Shoulder';
const DEMO_DURATION = '2–4 weeks ago';
const DEMO_INTENSITY = 7;
const DEMO_ACTIVITY: ActivityId = 'moderate';
const DEMO_REGIONS = ['Shoulder / Shoulder blade', 'Upper Arm'];
const DEMO_IMPACTS = ['Carrying a bag or groceries'];

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
  if (step.kind === 'pt-reveal') return `pt-reveal:${step.beat}:${turnCount}`;
  if (step.kind === 'chat-intro') return `chat-intro:${step.beat}:${turnCount}`;
  if (step.kind === 'notify') return `notify:${step.dialog}:${turnCount}`;
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
  if (step.kind === 'kit-teaser') return 'Welcome kit';
  if (step.kind === 'camera') return 'Camera';
  if (step.kind === 'offer') return 'Session';
  if (step.kind === 'safety') return 'Safety';
  if (step.kind === 'placement-intro') return 'Setup';
  if (step.kind === 'placement') return 'Placement';
  if (step.kind === 'exercise') return 'Exercise';
  if (step.kind === 'reward-reveal') return 'Reward';
  if (step.kind === 'reward-shipping') return 'Shipping';
  if (step.kind === 'reward-confirmation') return 'Reward sent';
  if (step.kind === 'pt-reveal') return 'PT reveal';
  if (step.kind === 'chat-intro') return 'Care team';
  if (step.kind === 'notify') return 'Notify';
  if (step.kind === 'chat-transition') return 'Meet in chat';
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
    this.turns.push({
      id: this.nextTurnId(),
      role: 'member',
      text,
      kind: 'answer',
    });
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

function buildIntakeTurns(nextTurnId: () => string) {
  const builder = new TurnBuilder(nextTurnId);
  buildGuideTurns(nextTurnId).forEach((turn) => {
    builder.turns.push(turn);
  });
  builder
    .member(READY_LABEL)
    .phoenix(areaQuestion(0))
    .member(DEMO_AREA)
    .phoenix(regionQuestion(DEMO_AREA))
    .member(regionAnswer(DEMO_REGIONS))
    .phoenix(durationQuestion(DEMO_AREA))
    .member(DEMO_DURATION)
    .phoenix(durationCareLine(DEMO_DURATION), 'care')
    .phoenix(intensityQuestion())
    .member(intensityAnswer(DEMO_INTENSITY))
    .phoenix(intensityCareLine(DEMO_INTENSITY), 'care')
    .phoenix(impactQuestion())
    .member(impactAnswer(DEMO_IMPACTS))
    .phoenix(impactCareLine(), 'care')
    .phoenix(conditionWrapLine(DEMO_AREA), 'care')
    .phoenix(moreQuestion())
    .member(MORE_NO_LABEL)
    .phoenix(activityIntroLine(), 'care')
    .phoenix(activityQuestion());
  return builder.snapshot();
}

function buildSafetyQuestionTurns(nextTurnId: () => string) {
  const builder = new TurnBuilder(nextTurnId);
  buildIntakeTurns(nextTurnId).forEach((turn) => {
    builder.turns.push(turn);
  });
  builder
    .member(activityLabel(DEMO_ACTIVITY))
    .phoenix(activityCareLine(DEMO_ACTIVITY), 'care')
    .phoenix(safetyLine());
  return builder.snapshot();
}

function buildClearedKitTurns(nextTurnId: () => string) {
  const builder = new TurnBuilder(nextTurnId);
  buildSafetyQuestionTurns(nextTurnId).forEach((turn) => {
    builder.turns.push(turn);
  });
  builder
    .member(SAFETY_NONE_LABEL)
    .phoenix(sessionIntroLine(currentArea(demoActivityAnswers())))
    .phoenix(cameraLine())
    .phoenix(kitTeaserLine());
  return builder.snapshot();
}

function buildOfferTurns(nextTurnId: () => string) {
  const builder = new TurnBuilder(nextTurnId);
  buildClearedKitTurns(nextTurnId).forEach((turn) => {
    builder.turns.push(turn);
  });
  builder.phoenix(offerLine());
  return builder.snapshot();
}

function buildReadyTurns(nextTurnId: () => string) {
  const builder = new TurnBuilder(nextTurnId);
  buildOfferTurns(nextTurnId).forEach((turn) => {
    builder.turns.push(turn);
  });
  builder.member(START_SESSION_LABEL);
  return builder.snapshot();
}

function buildFlagKitTurns(nextTurnId: () => string) {
  const builder = new TurnBuilder(nextTurnId);
  buildSafetyQuestionTurns(nextTurnId).forEach((turn) => {
    builder.turns.push(turn);
  });
  builder
    .member(SAFETY_FLAGS[0])
    .phoenix(flagsCareLine(), 'care')
    .phoenix(flagsAdaptLine(), 'care')
    .phoenix(sessionIntroLine(currentArea(demoActivityAnswers())))
    .phoenix(cameraLine())
    .phoenix(kitTeaserLine());
  return builder.snapshot();
}

function streamedIdsForTurns(turns: StackTurn[]) {
  return turns.map((turn) => turn.id);
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
  },
): JumpState {
  return {
    checkpoints,
    targetIndex,
    streamedTurnIds: streamedIdsForTurns(turns),
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
      },
    );
  }

  const intakeAnswers = demoIntakeAnswers();
  const intakeTurns = buildIntakeTurns(nextTurnId);
  const activityStep: PhoenixStep = { kind: 'activity' };
  checkpoints.push(
    makeCheckpoint(
      'phoenix',
      { kind: 'guide', index: 0 },
      EMPTY_ANSWERS,
      [intakeTurns[0]],
      'speak',
      null,
      0,
    ),
  );
  checkpoints.push(
    makeCheckpoint(
      'phoenix',
      { kind: 'ready' },
      EMPTY_ANSWERS,
      intakeTurns.slice(0, 4),
      'listen',
      null,
      0,
    ),
  );
  checkpoints.push(
    makeCheckpoint(
      'phoenix',
      { kind: 'know', index: 0 },
      EMPTY_ANSWERS,
      intakeTurns.slice(0, 6),
      'listen',
      null,
      0,
    ),
  );
  checkpoints.push(
    makeCheckpoint(
      'phoenix',
      activityStep,
      intakeAnswers,
      intakeTurns,
      'listen',
      null,
      0,
    ),
  );

  if (destinationId === 'activity') {
    return finishJump(
      destinationId,
      checkpoints,
      3,
      intakeTurns,
      intakeAnswers,
      'phoenix',
      activityStep,
      'listen',
      null,
      0,
      {
        isHero: true,
      },
    );
  }

  const activityAnswers = demoActivityAnswers();
  const safetyTurns = buildSafetyQuestionTurns(nextTurnId);
  const safetyStep: PhoenixStep = { kind: 'safety' };
  checkpoints.push(
    makeCheckpoint(
      'phoenix',
      safetyStep,
      activityAnswers,
      safetyTurns,
      'listen',
      null,
      0,
    ),
  );

  if (destinationId === 'flags') {
    const flagAnswers = demoFlagAnswers();
    const flagTurns = buildFlagKitTurns(nextTurnId);
    const flagKitStep: PhoenixStep = { kind: 'kit-teaser' };
    checkpoints.push(
      makeCheckpoint(
        'phoenix',
        { kind: 'camera' },
        flagAnswers,
        flagTurns.slice(0, -1),
        'listen',
        null,
        0,
      ),
    );
    checkpoints.push(
      makeCheckpoint(
        'phoenix',
        flagKitStep,
        flagAnswers,
        flagTurns,
        'listen',
        null,
        0,
      ),
    );
    return finishJump(
      destinationId,
      checkpoints,
      checkpoints.length - 1,
      flagTurns,
      flagAnswers,
      'phoenix',
      flagKitStep,
      'listen',
      null,
      0,
      {
        isHero: true,
      },
    );
  }

  const teaserTurns = buildClearedKitTurns(nextTurnId);
  checkpoints.push(
    makeCheckpoint(
      'phoenix',
      { kind: 'camera' },
      activityAnswers,
      teaserTurns.slice(0, -1),
      'listen',
      null,
      0,
    ),
  );
  checkpoints.push(
    makeCheckpoint(
      'phoenix',
      { kind: 'kit-teaser' },
      activityAnswers,
      teaserTurns,
      'listen',
      null,
      0,
    ),
  );

  if (destinationId === 'session') {
    return finishJump(
      destinationId,
      checkpoints,
      checkpoints.length - 1,
      teaserTurns,
      activityAnswers,
      'phoenix',
      { kind: 'kit-teaser' },
      'listen',
      null,
      0,
      {
        isHero: true,
      },
    );
  }

  const offerTurns = buildOfferTurns(nextTurnId);
  checkpoints.push(
    makeCheckpoint(
      'phoenix',
      { kind: 'offer' },
      activityAnswers,
      offerTurns,
      'listen',
      null,
      0,
    ),
  );

  if (destinationId === 'reward') {
    const activityAnswers = demoActivityAnswers();
    const clearanceTurns = buildReadyTurns(nextTurnId);
    const exerciseStep: PhoenixStep = { kind: 'exercise' };
    checkpoints.push(
      makeCheckpoint(
        'phoenix',
        exerciseStep,
        activityAnswers,
        clearanceTurns,
        'listen',
        null,
        0,
      ),
    );
    const rewardStep: PhoenixStep = { kind: 'reward-reveal' };
    checkpoints.push(
      makeCheckpoint(
        'phoenix',
        rewardStep,
        activityAnswers,
        clearanceTurns,
        'listen',
        null,
        0,
      ),
    );
    return finishJump(
      destinationId,
      checkpoints,
      checkpoints.length - 1,
      clearanceTurns,
      activityAnswers,
      'phoenix',
      rewardStep,
      'listen',
      null,
      0,
      {
        isHero: true,
      },
    );
  }

  if (
    destinationId === 'pt' ||
    destinationId === 'chat-intro' ||
    destinationId === 'notify'
  ) {
    const activityAnswers = demoActivityAnswers();
    const step: PhoenixStep =
      destinationId === 'pt'
        ? { kind: 'pt-reveal', beat: 0 }
        : destinationId === 'chat-intro'
          ? { kind: 'chat-intro', beat: 0 }
          : { kind: 'notify', dialog: false };
    const turns: StackTurn[] = [
      {
        id: nextTurnId(),
        role: 'phoenix',
        text: 'Connecting with your physical therapist',
        kind: 'question',
      },
    ];
    checkpoints.push(
      makeCheckpoint(
        'phoenix',
        step,
        activityAnswers,
        turns,
        'listen',
        null,
        0,
      ),
    );
    return finishJump(
      destinationId,
      checkpoints,
      0,
      turns,
      activityAnswers,
      'phoenix',
      step,
      'listen',
      null,
      0,
      { isHero: true },
    );
  }

  const readyTurns = buildReadyTurns(nextTurnId);
  const placementStep: PhoenixStep = { kind: 'placement' };
  checkpoints.push(
    makeCheckpoint(
      'phoenix',
      placementStep,
      activityAnswers,
      readyTurns,
      'listen',
      null,
      0,
    ),
  );
  return finishJump(
    destinationId,
    checkpoints,
    checkpoints.length - 1,
    readyTurns,
    activityAnswers,
    'phoenix',
    placementStep,
    'listen',
    null,
    0,
    {
      isHero: true,
    },
  );
}

export function jumpDestinationForShortcut(key: string) {
  return JUMP_DESTINATIONS.find((destination) => destination.shortcut === key);
}
