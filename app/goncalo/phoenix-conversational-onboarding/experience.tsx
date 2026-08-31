'use client';

import { mergeTailwindClasses as cn } from '@/design/utils';
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from 'react';
import {
  buildJumpState,
  type JumpDestinationId,
} from './checkpoint-jumps';
import { AssessmentScene } from './assessment-scene';
import { RewardConfirmationScene } from './reward-confirmation-scene';
import { RewardRevealScene } from './reward-reveal-scene';
import { RewardShippingScene } from './reward-shipping-scene';
import { ChatScene } from './chat-scene';
import { PhoenixCopy } from './conversation-variants';
import { HomeIndicatorSpace, StatusBar } from './device-frame';
import {
  CAMERA_HEADING_TURN,
  CONFIRM_HEADING_TURN,
  CameraPanel,
  ConfirmPanel,
  ContinuityPanel,
  OFFER_HEADING_TURN,
  OfferPanel,
  SafetyPanel,
  SchedulePanel,
  panelHeadingTurn,
} from './extended-scenes';
import { LaurenPortrait, laurenPortraitSrc } from './lauren-portrait';
import { PhoenixOrb, type PhoenixMood } from './phoenix-orb';
import {
  hasConversationTools,
  isImmersiveStep,
  isPanelStep,
  isRewardStep,
  streamDurationMs,
  type ConversationProps,
  type PhoenixStep,
  useDelayedTool,
} from './phoenix-scene';
import {
  type ActivityId,
  type Answers,
  type DoorId,
  type ScheduleDay,
  type StackTurn,
  CALL_NO_LABEL,
  CALL_YES_LABEL,
  GUIDE_LINES,
  LATER_LABEL,
  READY_LABEL,
  MAX_BODY_AREAS,
  MORE_NO_LABEL,
  MORE_YES_LABEL,
  REMIND_NO_LABEL,
  REMIND_YES_LABEL,
  SAFETY_NONE_LABEL,
  SCHEDULE_DAYS,
  START_SESSION_LABEL,
  activityCareLine,
  activityIntroLine,
  activityLabel,
  activityQuestion,
  callCareLine,
  callQuestion,
  completeCondition,
  currentArea,
  durationCareLine,
  durationQuestion,
  doorLabel,
  flagsCareLine,
  flagsQuestion,
  areaQuestion,
  followUpQuestion,
  intensityAnswer,
  intensityCareLine,
  intensityQuestion,
  moreQuestion,
  placementIntroLine,
  remindQuestion,
  selectedAreas,
  scheduleLine,
  sessionIntroLine,
  safetyLine,
  startNextCondition,
  tinglingCareLine,
  appointmentDayLabel,
} from './script';
import { WorldBackdrop } from './world-scene';

type Phase = 'entering' | 'phoenix' | 'exiting' | 'chat';
type Layout =
  | 'seed'
  | 'hero'
  | 'compact'
  | 'avatar'
  | 'panel'
  | 'panel-header'
  | 'immersive';

const PAIR_SIZE_PX = 120;
const PAIR_OVERLAP_PX = 20;
const PAIR_GAP_PX = 4;
const PAIR_CUTOUT_RADIUS_PX = PAIR_SIZE_PX / 2 + PAIR_GAP_PX;
const PAIR_CUTOUT_X = `calc(100% + ${PAIR_SIZE_PX / 2 - PAIR_OVERLAP_PX}px)`;
const PAIR_CUTOUT_MASK = `radial-gradient(circle ${PAIR_CUTOUT_RADIUS_PX}px at ${PAIR_CUTOUT_X} 50%, transparent ${PAIR_CUTOUT_RADIUS_PX}px, #000 ${PAIR_CUTOUT_RADIUS_PX + 1}px)`;
const CARE_LEAD_MS = 700;
const CARE_HOLD_MS = 400;
const LATER_CARE_LEAD_MS = 500;
const STREAM_FALLBACK_MS = 800;
const SCHEDULE_MORPH_HOLD_MS = 500;
const PLACEMENT_HOLD_MS = 2500;
const EXERCISE_HOLD_MS = 3000;

const pairCutoutStyle = {
  WebkitMaskImage: PAIR_CUTOUT_MASK,
  maskImage: PAIR_CUTOUT_MASK,
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
} as const;

export interface ExperienceHandle {
  prevQuestion: () => void;
  nextQuestion: () => void;
  jumpTo: (destinationId: JumpDestinationId) => void;
}

export interface ExperienceControls {
  canPrev: boolean;
  canNext: boolean;
}

interface Checkpoint {
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

const EMPTY_ANSWERS: Answers = {
  area: null,
  duration: null,
  intensity: null,
  tingling: null,
  completed: [],
  activity: null,
  safetyFlags: [],
  appointmentDay: null,
  appointmentTime: null,
};

function lineFor(step: PhoenixStep, answers: Answers) {
  if (step.kind === 'guide') return GUIDE_LINES[step.index];
  if (step.kind === 'ready') return GUIDE_LINES[3];
  if (step.kind === 'more') return moreQuestion(answers.area ?? 'that');
  if (step.kind === 'activity') return activityQuestion();
  if (step.kind === 'session') return sessionIntroLine(currentArea(answers));
  if (step.kind === 'placement-intro') return placementIntroLine();
  if (step.kind === 'call') {
    return answers.safetyFlags.length > 0 ? flagsQuestion() : callQuestion();
  }
  if (step.kind === 'remind') return remindQuestion();
  if (step.kind === 'know' && step.index === 0) {
    return areaQuestion(answers.completed.length);
  }
  if (step.kind === 'know' && step.index === 1) return durationQuestion();
  if (step.kind === 'know' && step.index === 2) return intensityQuestion();
  if (step.kind === 'know') return followUpQuestion(answers.area ?? 'Neck');
  return '';
}

function turnKind(step: PhoenixStep): StackTurn['kind'] {
  if (step.kind === 'guide') return 'guide';
  return 'question';
}

function cloneAnswers(answers: Answers): Answers {
  return {
    ...answers,
    completed: answers.completed.map((condition) => ({ ...condition })),
    safetyFlags: [...answers.safetyFlags],
  };
}

function cloneStep(step: PhoenixStep): PhoenixStep {
  return { ...step };
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
  if (step.kind === 'call') return 'Call';
  if (step.kind === 'schedule') return 'Schedule';
  if (step.kind === 'confirm') return 'Confirm';
  if (step.kind === 'remind') return 'Remind';
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

export function Experience({
  navigatorRef,
  onControlsChange,
  fastDemo = false,
}: {
  navigatorRef?: Ref<ExperienceHandle | null>;
  onControlsChange?: (state: ExperienceControls) => void;
  fastDemo?: boolean;
} = {}) {
  const turnIdRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const restoringRef = useRef(false);
  const streamedTurnIdsRef = useRef(new Set<string>());
  const checkpointsRef = useRef<Checkpoint[]>([]);
  const checkpointIndexRef = useRef(-1);
  const phaseRef = useRef<Phase>('entering');
  const stepRef = useRef<PhoenixStep>({ kind: 'guide', index: 0 });
  const turnsRef = useRef<StackTurn[]>([]);
  const pendingRevealRef = useRef<(() => void) | null>(null);
  const fastDemoRef = useRef(fastDemo);
  fastDemoRef.current = fastDemo;
  const [phase, setPhase] = useState<Phase>('entering');
  const [isHero, setIsHero] = useState(false);
  const [step, setStep] = useState<PhoenixStep>({ kind: 'guide', index: 0 });
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [turns, setTurns] = useState<StackTurn[]>([]);
  const [mood, setMood] = useState<PhoenixMood>('think');
  const [door, setDoor] = useState<DoorId | null>(null);
  const [chatCount, setChatCount] = useState(0);
  const [skipToolDelay, setSkipToolDelay] = useState(false);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [checkpointIndex, setCheckpointIndex] = useState(-1);
  const [panelLayoutReady, setPanelLayoutReady] = useState(false);
  const [cameraContentReady, setCameraContentReady] = useState(false);
  const [offerContentReady, setOfferContentReady] = useState(false);
  const [safetyContentReady, setSafetyContentReady] = useState(false);
  const [confirmContentReady, setConfirmContentReady] = useState(false);
  const [sessionAfterReward, setSessionAfterReward] = useState(false);
  const rushExperience = skipToolDelay || fastDemo;
  const toolReady = useDelayedTool(
    phase === 'phoenix' && hasConversationTools(step) && mood === 'listen',
    rushExperience ? 0 : 480,
  );

  function delay(ms: number) {
    return fastDemoRef.current ? 0 : ms;
  }

  function hasStreamedTurn(turnId: string) {
    return streamedTurnIdsRef.current.has(turnId);
  }

  phaseRef.current = phase;
  stepRef.current = step;
  turnsRef.current = turns;

  function nextTurnId() {
    turnIdRef.current += 1;
    return `turn-${turnIdRef.current}`;
  }

  function later(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }

  function clearTimers() {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }

  function cancelPendingReveal() {
    pendingRevealRef.current = null;
  }

  function revealPending() {
    const reveal = pendingRevealRef.current;
    if (!reveal) return;
    pendingRevealRef.current = null;
    reveal();
  }

  function speakCareThen(
    care: string,
    reveal: () => void,
    leadMs = CARE_LEAD_MS,
  ) {
    pendingRevealRef.current = reveal;
    later(() => {
      pushTurns({ role: 'phoenix', text: care, kind: 'care' });
      setMood('speak');
      later(
        revealPending,
        delay(streamDurationMs(care) + CARE_HOLD_MS + STREAM_FALLBACK_MS),
      );
    }, delay(leadMs));
  }

  function pushTurns(...incoming: Omit<StackTurn, 'id'>[]) {
    setTurns((current) => [
      ...current,
      ...incoming.map((turn) => ({ ...turn, id: nextTurnId() })),
    ]);
  }

  function makeCheckpoint(
    nextPhase: Phase,
    nextStep: PhoenixStep,
    nextAnswers: Answers,
    nextTurns: StackTurn[],
    nextMood: PhoenixMood,
    nextDoor: DoorId | null,
    nextChatCount: number,
    nextSessionAfterReward: boolean,
  ): Checkpoint {
    return {
      key: checkpointKey(nextPhase, nextStep, nextTurns.length),
      label: checkpointLabel(nextPhase, nextStep, nextAnswers, nextDoor),
      phase: nextPhase,
      step: cloneStep(nextStep),
      answers: cloneAnswers(nextAnswers),
      turns: [...nextTurns],
      mood: nextMood,
      door: nextDoor,
      chatCount: nextChatCount,
      sessionAfterReward: nextSessionAfterReward,
    };
  }

  function recordCheckpoint(snapshot: Checkpoint) {
    if (checkpointIndexRef.current < checkpointsRef.current.length - 1) {
      return;
    }

    const last = checkpointsRef.current.at(-1);
    if (last?.key === snapshot.key) return;

    const next = [...checkpointsRef.current, snapshot];
    checkpointsRef.current = next;
    checkpointIndexRef.current = next.length - 1;
    setCheckpoints(next);
    setCheckpointIndex(next.length - 1);
  }

  function discardFutureCheckpoints() {
    const index = checkpointIndexRef.current;
    if (index < 0 || index >= checkpointsRef.current.length - 1) return;

    const next = checkpointsRef.current.slice(0, index + 1);
    checkpointsRef.current = next;
    setCheckpoints(next);
  }

  function restoreCheckpoint(index: number) {
    const snapshot = checkpointsRef.current[index];
    if (!snapshot) return;

    clearTimers();
    cancelPendingReveal();
    restoringRef.current = true;
    checkpointIndexRef.current = index;
    setCheckpointIndex(index);
    setSkipToolDelay(true);
    setPhase(snapshot.phase);
    setStep(cloneStep(snapshot.step));
    setAnswers(cloneAnswers(snapshot.answers));
    setTurns([...snapshot.turns]);
    setMood(snapshot.mood);
    setDoor(snapshot.door);
    setChatCount(snapshot.chatCount);
    setSessionAfterReward(snapshot.sessionAfterReward);
    setPanelLayoutReady(
      snapshot.step.kind === 'schedule' || snapshot.step.kind === 'safety',
    );
    setCameraContentReady(snapshot.step.kind === 'camera');
    setOfferContentReady(snapshot.step.kind === 'offer');
    setSafetyContentReady(snapshot.step.kind === 'safety');
    setConfirmContentReady(snapshot.step.kind === 'confirm');
  }

  function jumpTo(destinationId: JumpDestinationId) {
    clearTimers();
    cancelPendingReveal();
    restoringRef.current = true;
    setSkipToolDelay(true);

    const jump = buildJumpState(destinationId, nextTurnId);
    streamedTurnIdsRef.current = new Set(jump.streamedTurnIds);
    checkpointsRef.current = jump.checkpoints;
    checkpointIndexRef.current = jump.targetIndex;
    setCheckpoints(jump.checkpoints);
    setCheckpointIndex(jump.targetIndex);
    setIsHero(jump.isHero);
    setPhase(jump.phase);
    setStep(cloneStep(jump.step));
    setAnswers(cloneAnswers(jump.answers));
    setTurns([...jump.turns]);
    setMood(jump.mood);
    setDoor(jump.door);
    setChatCount(jump.chatCount);
    setSessionAfterReward(
      jump.checkpoints[jump.targetIndex]?.sessionAfterReward ?? false,
    );
    setPanelLayoutReady(jump.panelLayoutReady);
    setCameraContentReady(jump.cameraContentReady);
    setOfferContentReady(jump.offerContentReady);
    setSafetyContentReady(jump.safetyContentReady);
    setConfirmContentReady(jump.confirmContentReady);
  }

  useImperativeHandle(navigatorRef, () => ({
    prevQuestion() {
      if (phaseRef.current === 'exiting') {
        restoreCheckpoint(checkpointIndexRef.current);
        return;
      }

      const index = checkpointIndexRef.current;
      if (index <= 0) return;
      restoreCheckpoint(index - 1);
    },
    nextQuestion() {
      const index = checkpointIndexRef.current;
      if (index >= checkpointsRef.current.length - 1) return;
      restoreCheckpoint(index + 1);
    },
    jumpTo,
  }));

  useEffect(() => {
    onControlsChange?.({
      canPrev: checkpointIndex > 0 || phase === 'exiting',
      canNext: checkpointIndex >= 0 && checkpointIndex < checkpoints.length - 1,
    });
  }, [checkpoints.length, checkpointIndex, onControlsChange, phase]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    const image = new window.Image();
    image.src = laurenPortraitSrc;
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setIsHero(true), delay(40));
    return () => window.clearTimeout(id);
  }, [fastDemo]);

  useEffect(() => {
    if (restoringRef.current) return;
    if (phase !== 'entering') return;
    const id = window.setTimeout(() => {
      setPhase('phoenix');
      setMood('speak');
    }, delay(1200));
    return () => window.clearTimeout(id);
  }, [phase, fastDemo]);

  useEffect(() => {
    if (phase !== 'phoenix') return;
    setTurns((current) => {
      if (current.length > 0) return current;
      return [
        {
          id: nextTurnId(),
          role: 'phoenix',
          text: GUIDE_LINES[0],
          kind: 'guide',
        },
      ];
    });
  }, [phase]);

  useEffect(() => {
    if (restoringRef.current) return;
    if (phase !== 'phoenix' || step.kind !== 'guide') return;
    setMood('speak');
  }, [phase, step]);

  useEffect(() => {
    if (restoringRef.current) return;
    if (phase !== 'phoenix' || step.kind === 'guide') return;
    if (isPanelStep(step)) {
      setMood('listen');
      return;
    }
    setMood('speak');
  }, [phase, step]);

  useEffect(() => {
    if (restoringRef.current) return;
    if (
      phase !== 'phoenix' ||
      (!isPanelStep(step) && !isImmersiveStep(step))
    ) {
      return;
    }
    recordCheckpoint(
      makeCheckpoint(
        phase,
        step,
        answers,
        turns,
        'listen',
        door,
        chatCount,
        sessionAfterReward,
      ),
    );
  }, [phase, step]);

  useEffect(() => {
    if (restoringRef.current) return;
    if (phase !== 'phoenix' || step.kind !== 'session' || mood !== 'listen') {
      return;
    }
    const id = window.setTimeout(() => {
      setStep({ kind: 'offer' });
    }, delay(1600));
    return () => window.clearTimeout(id);
  }, [phase, step, mood, fastDemo]);

  useEffect(() => {
    if (restoringRef.current) return;
    if (
      phase !== 'phoenix' ||
      step.kind !== 'placement-intro' ||
      mood !== 'listen'
    ) {
      return;
    }
    const id = window.setTimeout(() => {
      setStep({ kind: 'camera' });
    }, delay(1600));
    return () => window.clearTimeout(id);
  }, [phase, step, mood, fastDemo]);

  useEffect(() => {
    if (restoringRef.current) return;
    if (phase !== 'phoenix' || step.kind !== 'placement') return;
    const id = window.setTimeout(() => {
      setStep({ kind: 'exercise' });
    }, delay(PLACEMENT_HOLD_MS));
    return () => window.clearTimeout(id);
  }, [phase, step, fastDemo]);

  useEffect(() => {
    if (restoringRef.current) return;
    if (phase !== 'phoenix' || step.kind !== 'exercise') return;
    const id = window.setTimeout(() => {
      beginRewardFlow();
    }, delay(EXERCISE_HOLD_MS));
    return () => window.clearTimeout(id);
  }, [phase, step, fastDemo]);

  useEffect(() => {
    if (restoringRef.current) return;
    if (step.kind !== 'schedule' && step.kind !== 'safety') {
      setPanelLayoutReady(false);
    }
    if (step.kind !== 'camera') setCameraContentReady(false);
    else if (streamedTurnIdsRef.current.has(CAMERA_HEADING_TURN.id)) {
      setCameraContentReady(true);
    }
    if (step.kind !== 'offer') setOfferContentReady(false);
    if (step.kind !== 'safety') setSafetyContentReady(false);
    if (step.kind !== 'confirm') setConfirmContentReady(false);
  }, [step.kind]);

  useEffect(() => {
    if (restoringRef.current) return;
    if (phase !== 'exiting' || !door) return;
    const id = window.setTimeout(() => {
      setPhase('chat');
      setMood('breath');
    }, delay(1100));
    return () => window.clearTimeout(id);
  }, [phase, door, fastDemo]);

  useEffect(() => {
    if (restoringRef.current) return;
    if (phase !== 'chat' || !door) return;
    const messageCount = sessionAfterReward ? 1 : 2;
    if (fastDemo) {
      setChatCount(messageCount);
      return;
    }
    setChatCount(0);
    const first = window.setTimeout(() => setChatCount(1), 700);
    if (messageCount === 1) {
      return () => window.clearTimeout(first);
    }
    const second = window.setTimeout(() => setChatCount(2), 1700);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [phase, door, fastDemo, sessionAfterReward]);

  useEffect(() => {
    if (phase !== 'chat' || !door) return;
    const messageCount = sessionAfterReward ? 1 : 2;
    if (chatCount < messageCount) return;
    recordCheckpoint(
      makeCheckpoint(
        'chat',
        step,
        answers,
        turns,
        'breath',
        door,
        chatCount,
        sessionAfterReward,
      ),
    );
  }, [phase, door, chatCount, step, answers, turns, sessionAfterReward]);

  useEffect(() => {
    restoringRef.current = false;
  });

  function commitMember(
    text: string,
    next: PhoenixStep,
    nextAnswers: Answers,
    care?: string,
  ) {
    discardFutureCheckpoints();
    setSkipToolDelay(false);
    pushTurns({ role: 'member', text, kind: 'answer' });
    setMood('think');

    const revealNext = () => {
      pushTurns({
        role: 'phoenix',
        text: lineFor(next, nextAnswers),
        kind: turnKind(next),
      });
      setStep(next);
    };

    if (care) {
      speakCareThen(care, revealNext);
      return;
    }

    later(revealNext, delay(620));
  }

  function enterChat(nextDoor: DoorId) {
    discardFutureCheckpoints();
    setSkipToolDelay(false);
    setDoor(nextDoor);
    setPhase('exiting');
    setMood('think');
  }

  function beginRewardFlow() {
    discardFutureCheckpoints();
    setSkipToolDelay(false);
    setSessionAfterReward(false);
    setStep({ kind: 'reward-reveal' });
    setMood('listen');
  }

  function enterChatAfterReward() {
    setSessionAfterReward(true);
    enterChat('session');
  }

  function goToRewardShipping() {
    discardFutureCheckpoints();
    setSkipToolDelay(false);
    setStep({ kind: 'reward-shipping' });
    setMood('listen');
  }

  function goToRewardConfirmation() {
    discardFutureCheckpoints();
    setSkipToolDelay(false);
    setStep({ kind: 'reward-confirmation' });
    setMood('listen');
  }

  function goToPanel(next: PhoenixStep) {
    discardFutureCheckpoints();
    setSkipToolDelay(false);
    setStep(next);
    setMood('listen');
  }

  const layout: Layout =
    phase === 'chat' || phase === 'exiting'
      ? 'avatar'
      : phase === 'entering' && !isHero
        ? 'seed'
        : phase === 'phoenix' && isImmersiveStep(step)
          ? 'immersive'
          : phase === 'phoenix' &&
              (step.kind === 'camera' ||
                step.kind === 'offer' ||
                ((step.kind === 'schedule' || step.kind === 'safety') &&
                  panelLayoutReady))
            ? 'panel-header'
            : phase === 'phoenix' && isPanelStep(step)
              ? 'panel'
              : phase === 'phoenix' &&
                  step.kind !== 'guide' &&
                  step.kind !== 'ready'
                ? 'compact'
                : 'hero';

  const showChat = phase === 'exiting' || phase === 'chat';
  const showConversation =
    (phase === 'phoenix' || phase === 'exiting') &&
    !isPanelStep(step) &&
    !isImmersiveStep(step) &&
    !isRewardStep(step) &&
    !(step.kind === 'schedule' && panelLayoutReady) &&
    !(step.kind === 'safety' && panelLayoutReady);
  const confirmDay =
    SCHEDULE_DAYS.find(
      (day) => appointmentDayLabel(day) === answers.appointmentDay,
    ) ?? SCHEDULE_DAYS[0];
  const isPaired =
    layout === 'hero' &&
    phase === 'phoenix' &&
    (step.kind === 'ready' || (step.kind === 'guide' && step.index >= 1));
  // Only the first question (area chips) needs the small left orb — later steps keep centered.
  const compactToolsReady =
    layout === 'compact' &&
    toolReady &&
    step.kind === 'know' &&
    step.index === 0;
  const orbLayout: Layout = compactToolsReady ? 'panel-header' : layout;

  const conversation: ConversationProps = {
    turns,
    step,
    toolReady,
    reserveOrbSlot: compactToolsReady,
    excludedAreas: selectedAreas(answers),
    hasStreamedTurn,
    instantStream: fastDemo,
    onTurnStreamComplete: (turnId: string) => {
      streamedTurnIdsRef.current.add(turnId);
      const currentTurn = turnsRef.current.at(-1);
      if (
        phaseRef.current !== 'phoenix' ||
        currentTurn?.id !== turnId ||
        currentTurn.role !== 'phoenix'
      ) {
        return;
      }
      setMood(currentTurn.kind === 'question' ? 'listen' : 'breath');
      if (currentTurn.kind === 'care') {
        later(revealPending, delay(CARE_HOLD_MS));
        return;
      }
      if (currentTurn.kind !== 'question') return;
      if (stepRef.current.kind === 'session') return;
      if (stepRef.current.kind === 'placement-intro') return;
      recordCheckpoint(
        makeCheckpoint(
          phaseRef.current,
          stepRef.current,
          answers,
          turnsRef.current,
          'listen',
          door,
          chatCount,
          sessionAfterReward,
        ),
      );
      if (stepRef.current.kind === 'schedule' || stepRef.current.kind === 'safety') {
        later(() => {
          setPanelLayoutReady(true);
          if (stepRef.current.kind === 'safety') {
            setSafetyContentReady(true);
          }
        }, delay(SCHEDULE_MORPH_HOLD_MS));
      }
    },
    onGuideAdvance: () => {
      if (step.kind !== 'guide' || mood !== 'breath') return;
      if (step.index < 2) {
        const nextIndex = (step.index + 1) as 1 | 2;
        pushTurns({
          role: 'phoenix',
          text: GUIDE_LINES[nextIndex],
          kind: 'guide',
        });
        setStep({ kind: 'guide', index: nextIndex });
        return;
      }
      pushTurns({
        role: 'phoenix',
        text: GUIDE_LINES[3],
        kind: 'question',
      });
      setStep({ kind: 'ready' });
    },
    onSessionAdvance: () => {
      if (step.kind === 'session' && mood === 'listen') {
        goToPanel({ kind: 'offer' });
        return;
      }
      if (step.kind === 'placement-intro' && mood === 'listen') {
        goToPanel({ kind: 'camera' });
      }
    },
    onReady: () => {
      commitMember(READY_LABEL, { kind: 'know', index: 0 }, answers);
    },
    onArea: (area: string) => {
      const nextAnswers = { ...answers, area };
      setAnswers(nextAnswers);
      commitMember(area, { kind: 'know', index: 1 }, nextAnswers);
    },
    onDuration: (duration: string) => {
      const nextAnswers = { ...answers, duration };
      setAnswers(nextAnswers);
      commitMember(
        duration,
        { kind: 'know', index: 2 },
        nextAnswers,
        durationCareLine(duration),
      );
    },
    onIntensity: (intensity: number) => {
      const nextAnswers = { ...answers, intensity };
      setAnswers(nextAnswers);
      commitMember(
        intensityAnswer(intensity),
        { kind: 'know', index: 3 },
        nextAnswers,
        intensityCareLine(intensity),
      );
    },
    onTingling: (tingling: boolean) => {
      const nextAnswers = completeCondition({ ...answers, tingling });
      setAnswers(nextAnswers);
      const atMax = nextAnswers.completed.length >= MAX_BODY_AREAS;
      commitMember(
        tingling ? 'Yes' : 'No',
        atMax ? { kind: 'activity' } : { kind: 'more' },
        nextAnswers,
        tingling
          ? tinglingCareLine()
          : atMax
            ? activityIntroLine()
            : undefined,
      );
    },
    onMore: (wantsMore: boolean) => {
      if (wantsMore) {
        const nextAnswers = startNextCondition(answers);
        setAnswers(nextAnswers);
        commitMember(MORE_YES_LABEL, { kind: 'know', index: 0 }, nextAnswers);
        return;
      }

      commitMember(
        MORE_NO_LABEL,
        { kind: 'activity' },
        answers,
        activityIntroLine(),
      );
    },
    onActivity: (id: ActivityId) => {
      const nextAnswers = { ...answers, activity: id };
      setAnswers(nextAnswers);
      commitMember(
        activityLabel(id),
        { kind: 'session' },
        nextAnswers,
        activityCareLine(id),
      );
    },
    onCallYes: () => {
      discardFutureCheckpoints();
      setSkipToolDelay(false);
      pushTurns({
        role: 'member',
        text: CALL_YES_LABEL,
        kind: 'answer',
      });
      setMood('think');
      later(() => {
        pushTurns({
          role: 'phoenix',
          text: scheduleLine(),
          kind: 'question',
        });
        setPanelLayoutReady(false);
        setStep({ kind: 'schedule' });
      }, delay(620));
    },
    onCallNo: () => {
      commitMember(CALL_NO_LABEL, { kind: 'remind' }, answers);
    },
    onRemindYes: () => {
      discardFutureCheckpoints();
      setSkipToolDelay(false);
      pushTurns({ role: 'member', text: REMIND_YES_LABEL, kind: 'answer' });
      enterChat('later');
    },
    onRemindNo: () => {
      discardFutureCheckpoints();
      setSkipToolDelay(false);
      pushTurns({ role: 'member', text: REMIND_NO_LABEL, kind: 'answer' });
      enterChat('later');
    },
  };

  return (
    <div className="relative h-full overflow-hidden bg-[#f6f4fb] select-none">
      <WorldBackdrop />
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-[#f4f7ff] transition-opacity duration-1000',
          showChat && phase === 'chat' ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div
        className={cn(
          'absolute inset-0 flex flex-col transition-opacity duration-700',
          phase === 'phoenix' ? 'opacity-100' : 'opacity-0',
          phase !== 'phoenix' && 'pointer-events-none',
        )}
      >
        {layout !== 'immersive' ? <StatusBar /> : null}
        <div
          className={cn(
            'shrink-0 transition-[height] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            layout === 'hero' && 'h-[232px]',
            layout === 'compact' && !compactToolsReady && 'h-[108px]',
            (layout === 'panel' ||
              layout === 'panel-header' ||
              layout === 'immersive' ||
              compactToolsReady) &&
              'h-0',
            layout !== 'hero' &&
              layout !== 'compact' &&
              layout !== 'panel' &&
              layout !== 'panel-header' &&
              layout !== 'immersive' &&
              'h-[232px]',
          )}
        />
        {showConversation ? <PhoenixCopy {...conversation} /> : null}
        {phase === 'phoenix' &&
        (step.kind === 'placement' || step.kind === 'exercise') ? (
          <AssessmentScene
            beat={step.kind === 'exercise' ? 'exercise' : 'placement'}
            onAdvance={() => {
              if (step.kind === 'placement') {
                goToPanel({ kind: 'exercise' });
                return;
              }
              beginRewardFlow();
            }}
          />
        ) : null}
        {phase === 'phoenix' && step.kind === 'reward-reveal' ? (
          <RewardRevealScene
            fastDemo={fastDemo}
            onContinue={goToRewardShipping}
          />
        ) : null}
        {phase === 'phoenix' && step.kind === 'reward-shipping' ? (
          <RewardShippingScene onSubmit={goToRewardConfirmation} />
        ) : null}
        {phase === 'phoenix' && step.kind === 'reward-confirmation' ? (
          <RewardConfirmationScene onContinue={enterChatAfterReward} />
        ) : null}
        {phase === 'phoenix' &&
        (step.kind === 'camera' || step.kind === 'offer') ? (
          <ContinuityPanel
            key={step.kind}
            heading={
              step.kind === 'camera' ? CAMERA_HEADING_TURN : OFFER_HEADING_TURN
            }
            hasStreamedTurn={conversation.hasStreamedTurn}
            instantStream={fastDemo}
            onTurnStreamComplete={(turnId) => {
              conversation.onTurnStreamComplete(turnId);
              if (turnId === OFFER_HEADING_TURN.id) {
                setOfferContentReady(true);
                return;
              }
              if (turnId === CAMERA_HEADING_TURN.id) {
                setCameraContentReady(true);
              }
            }}
          >
            {step.kind === 'camera' ? (
              <CameraPanel
                contentReady={cameraContentReady || rushExperience}
                onEnable={() => goToPanel({ kind: 'placement' })}
              />
            ) : (
              <OfferPanel
                area={currentArea(answers)}
                contentReady={offerContentReady || rushExperience}
                onStart={() => {
                  discardFutureCheckpoints();
                  setSkipToolDelay(false);
                  pushTurns({
                    role: 'member',
                    text: START_SESSION_LABEL,
                    kind: 'answer',
                  });
                  setMood('think');
                  setPanelLayoutReady(false);
                  setSafetyContentReady(false);
                  later(() => {
                    pushTurns({
                      role: 'phoenix',
                      text: safetyLine(),
                      kind: 'question',
                    });
                    setStep({ kind: 'safety' });
                  }, delay(620));
                }}
                onLater={() => {
                  discardFutureCheckpoints();
                  setSkipToolDelay(false);
                  pushTurns({
                    role: 'member',
                    text: LATER_LABEL,
                    kind: 'answer',
                  });
                  setStep({ kind: 'call' });
                  setMood('think');
                  speakCareThen(
                    callCareLine(),
                    () => {
                      pushTurns({
                        role: 'phoenix',
                        text: callQuestion(),
                        kind: 'question',
                      });
                    },
                    LATER_CARE_LEAD_MS,
                  );
                }}
              />
            )}
          </ContinuityPanel>
        ) : null}
        {phase === 'phoenix' && step.kind === 'safety' && panelLayoutReady ? (
          <ContinuityPanel
            heading={panelHeadingTurn('safety', turns)}
            hasStreamedTurn={conversation.hasStreamedTurn}
            instantStream={fastDemo}
            onTurnStreamComplete={(turnId) => {
              conversation.onTurnStreamComplete(turnId);
              const heading = panelHeadingTurn('safety', turns);
              if (turnId === heading.id) {
                setSafetyContentReady(true);
              }
            }}
          >
            <SafetyPanel
              contentReady={safetyContentReady || rushExperience}
              onContinue={(flags) => {
                const nextAnswers = { ...answers, safetyFlags: flags };
                setAnswers(nextAnswers);
                if (flags.length > 0) {
                  discardFutureCheckpoints();
                  setSkipToolDelay(false);
                  setStep({ kind: 'call' });
                  setMood('think');
                  speakCareThen(flagsCareLine(), () => {
                    pushTurns({
                      role: 'phoenix',
                      text: flagsQuestion(),
                      kind: 'question',
                    });
                  });
                  return;
                }
                discardFutureCheckpoints();
                setSkipToolDelay(false);
                setPanelLayoutReady(false);
                setSafetyContentReady(false);
                pushTurns({
                  role: 'member',
                  text: SAFETY_NONE_LABEL,
                  kind: 'answer',
                });
                setMood('think');
                later(() => {
                  pushTurns({
                    role: 'phoenix',
                    text: placementIntroLine(),
                    kind: 'question',
                  });
                  setStep({ kind: 'placement-intro' });
                }, delay(620));
              }}
            />
          </ContinuityPanel>
        ) : null}
        {phase === 'phoenix' &&
        step.kind === 'schedule' &&
        panelLayoutReady ? (
          <ContinuityPanel
            heading={panelHeadingTurn('schedule', turns)}
            hasStreamedTurn={conversation.hasStreamedTurn}
            instantStream={fastDemo}
            onTurnStreamComplete={conversation.onTurnStreamComplete}
          >
            <SchedulePanel
              onContinue={(day: ScheduleDay, time: string) => {
                setAnswers((current) => ({
                  ...current,
                  appointmentDay: appointmentDayLabel(day),
                  appointmentTime: time,
                }));
                goToPanel({ kind: 'confirm' });
              }}
            />
          </ContinuityPanel>
        ) : null}
        {phase === 'phoenix' && step.kind === 'confirm' ? (
          <ConfirmPanel
            day={confirmDay}
            time={answers.appointmentTime ?? '9:00 AM'}
            hasStreamedTurn={conversation.hasStreamedTurn}
            instantStream={fastDemo}
            onTurnStreamComplete={(turnId) => {
              conversation.onTurnStreamComplete(turnId);
              if (turnId === CONFIRM_HEADING_TURN.id) {
                setConfirmContentReady(true);
              }
            }}
            contentReady={confirmContentReady || rushExperience}
            onConfirm={() => enterChat('scheduled')}
          />
        ) : null}
        {layout !== 'immersive' ? <HomeIndicatorSpace /> : null}
      </div>

      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-700',
          showChat && phase === 'chat' ? 'opacity-100' : 'opacity-0',
          phase !== 'chat' && 'pointer-events-none',
        )}
      >
        {door && (phase === 'chat' || phase === 'exiting') ? (
          <ChatScene
            door={door}
            answers={answers}
            history={turns}
            avatarSlot
            visibleCount={phase === 'chat' ? chatCount : 0}
            afterReward={sessionAfterReward}
          />
        ) : null}
      </div>

      <div
        className={cn(
          'pointer-events-none absolute z-30 flex -translate-x-1/2 items-center justify-center',
          orbLayout !== 'panel' &&
            'transition-[top,left,width,height,translate,opacity] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          orbLayout === 'seed' && 'top-[42%] left-1/2 size-[60px]',
          orbLayout === 'hero' &&
            !isPaired &&
            'top-[64px] left-1/2 size-[148px]',
          orbLayout === 'hero' &&
            isPaired &&
            'top-[76px] left-1/2 h-[120px] w-[220px]',
          orbLayout === 'compact' && 'top-[48px] left-1/2 size-[80px]',
          orbLayout === 'panel' && 'pointer-events-none invisible size-0 opacity-0',
          orbLayout === 'immersive' &&
            'pointer-events-none invisible size-0 opacity-0',
          // `left` is the visual center (`-translate-x-1/2` is always on).
          // left-9 = left-4 + half of size-10; 60px = 44px + half of 32px.
          orbLayout === 'panel-header' && 'top-[64px] left-9 size-10',
          orbLayout === 'avatar' && 'top-[62px] left-[60px] size-[32px]',
        )}
      >
        <div
          className={cn(
            'relative aspect-square shrink-0 transition-[width,height] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            orbLayout === 'seed' && 'size-[60px]',
            orbLayout === 'hero' && (isPaired ? 'size-[120px]' : 'size-[148px]'),
            orbLayout === 'compact' && 'size-[80px]',
            orbLayout === 'panel' && 'size-0',
            orbLayout === 'immersive' && 'size-0',
            orbLayout === 'panel-header' && 'size-10',
            orbLayout === 'avatar' && 'size-[32px]',
          )}
        >
          <div
            className={cn(
              'relative h-full w-full',
              isPaired && 'overflow-hidden rounded-full',
            )}
            style={isPaired ? pairCutoutStyle : undefined}
          >
            <PhoenixOrb mood={mood} className="relative h-full w-full" />
          </div>
        </div>
        <div
          className={cn(
            'relative z-10 min-h-0 min-w-0 shrink-0 overflow-hidden rounded-full bg-gradient-to-b from-[#eaf2fe] to-[#a6c9f8] transition-[width,height,margin,opacity,transform] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            isPaired
              ? '-ml-5 size-[120px] translate-x-0 scale-100 opacity-100 shadow-[0_8px_8px_rgba(0,0,0,0.08)]'
              : 'ml-0 size-0 translate-x-2 scale-90 opacity-0',
          )}
        >
          <LaurenPortrait decorative />
        </div>
      </div>
    </div>
  );
}
