'use client';

import { mergeTailwindClasses as cn } from '@/design/utils';
import { ArrowUp, Mic } from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  liveWrapPending,
  parseAreas,
  parseDuration,
  parseExtras,
  parseField,
  parseIntensity,
  uniqueAreas,
  type AreaSpan,
  type IntakeField,
  type IntakeSpan,
} from './intake-parse';

// Variants:
// C — slot-first: empty pills appear before the member types
// E — wrap-after: words become pills only after they type them

export type ComposerMode = 'slot' | 'wrap';

export type AreaCommitMeta = {
  text: string;
  duration?: string;
  intensity?: number;
};

type CommitPayload = {
  areas: string[];
  duration?: string;
  intensity?: number;
  text: string;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
  start: () => void;
  stop: () => void;
};

function speechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null;
  const speechWindow = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return (
    speechWindow.SpeechRecognition ??
    speechWindow.webkitSpeechRecognition ??
    null
  );
}

function hintFor(field: IntakeField) {
  if (field === 'area') return 'e.g. pain when I bend, dull ache most days';
  if (field === 'duration') return 'e.g. a few weeks, since last month';
  return 'e.g. a 6, pretty bad';
}

function emptyLabel(field: IntakeField, filledCount: number) {
  if (field === 'area') return filledCount === 0 ? 'body area' : 'and where else';
  if (field === 'duration') return 'how long';
  return '0–10';
}

function missHint(field: IntakeField) {
  if (field === 'area') return 'I didn’t catch a body area yet';
  if (field === 'duration') return 'I didn’t catch how long it’s been';
  return 'Try a number from 0 to 10';
}

function pillLabel(span: IntakeSpan) {
  if (span.kind === 'area') return span.alternatives ? span.raw : span.area;
  if (span.kind === 'duration') return span.duration;
  return String(span.intensity);
}

function serializeSpans(text: string, spans: IntakeSpan[]) {
  if (spans.length === 0) {
    return [{ type: 'text' as const, text }];
  }

  const parts: Array<
    | { type: 'text'; text: string }
    | { type: 'pill'; span: IntakeSpan }
  > = [];
  let cursor = 0;
  for (const span of spans) {
    if (span.start > cursor) {
      parts.push({ type: 'text', text: text.slice(cursor, span.start) });
    }
    parts.push({ type: 'pill', span });
    cursor = span.end;
  }
  if (cursor < text.length) {
    parts.push({ type: 'text', text: text.slice(cursor) });
  }
  return parts;
}

function areaSpansFrom(areas: string[]): AreaSpan[] {
  return areas.map((area) => ({
    kind: 'area',
    area,
    raw: area,
    start: 0,
    end: area.length,
  }));
}

function payloadReady(field: IntakeField, payload: CommitPayload) {
  if (field === 'area') return payload.areas.length > 0;
  if (field === 'duration') return Boolean(payload.duration);
  return payload.intensity != null;
}

function Pill({
  children,
  ghost,
  onClick,
}: {
  children: string;
  ghost?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'text-body-medium-strong inline-flex max-w-full cursor-pointer items-center rounded-full px-2.5 py-0.5 align-baseline transition-colors',
        ghost
          ? 'text-foreground-neutral-faded border-border-neutral-subtle border border-dashed bg-transparent'
          : 'text-foreground-neutral-strong bg-background-neutral-subtle',
      )}
    >
      {children}
    </button>
  );
}

function IconButton({
  label,
  disabled,
  pressed,
  send,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  pressed?: boolean;
  send?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      data-intake-send={send || undefined}
      onClick={onClick}
      className={cn(
        'grid size-9 shrink-0 cursor-pointer place-items-center rounded-full transition-colors',
        pressed
          ? 'bg-background-brand-faded text-foreground-brand-default'
          : 'text-foreground-neutral-subtle hover:bg-background-neutral-subtle',
        disabled && 'cursor-not-allowed opacity-35 hover:bg-transparent',
      )}
    >
      {children}
    </button>
  );
}

function useMic(onTranscript: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const Recognition = useMemo(() => speechRecognition(), []);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
    };
  }, []);

  function toggle() {
    if (!Recognition) return;
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) onTranscriptRef.current(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  }

  return { listening, hasSpeech: Boolean(Recognition), toggle };
}

function SlotInput({
  placeholder,
  ghost,
  value,
  onChange,
  onSubmit,
  inputRef,
}: {
  placeholder: string;
  ghost?: boolean;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const widthCh = Math.max(placeholder.length, value.length, 1) + 1;

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          onSubmit();
        }
      }}
      placeholder={placeholder}
      aria-label={placeholder}
      className={cn(
        'text-body-medium-strong rounded-full border px-2.5 py-0.5 outline-none',
        ghost
          ? 'text-foreground-neutral-faded border-border-neutral-faded border-dashed bg-transparent placeholder:text-foreground-neutral-faded'
          : 'text-foreground-neutral-strong border-border-neutral-subtle bg-background-neutral-faded placeholder:text-foreground-neutral-faded',
      )}
      style={{ width: `${widthCh}ch` }}
    />
  );
}

function SlotComposer({
  field,
  maxAreas,
  seed,
  commitRef,
  onReadyChange,
  onSubmit,
}: {
  field: IntakeField;
  maxAreas: number;
  seed: string;
  commitRef: RefObject<(() => CommitPayload | null) | null>;
  onReadyChange: (ready: boolean) => void;
  onSubmit: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [areas, setAreas] = useState<string[]>([]);
  const [duration, setDuration] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [choices, setChoices] = useState<AreaSpan | null>(null);
  const [extraDuration, setExtraDuration] = useState<string | undefined>();
  const [extraIntensity, setExtraIntensity] = useState<number | undefined>();

  const filled =
    field === 'area'
      ? areas
      : field === 'duration'
        ? duration
          ? [duration]
          : []
        : intensity != null
          ? [String(intensity)]
          : [];

  const showSlot =
    field === 'area' ? areas.length < maxAreas : filled.length === 0 || draft.length > 0;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!seed) return;
    absorb(draft ? `${draft} ${seed}` : seed);
    // seed is applied once per transcript
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  function snapshot(nextDraft = draft, nextAreas = areas): CommitPayload {
    const liveExtras = parseExtras(nextDraft);
    const extras = {
      duration: extraDuration ?? liveExtras.duration,
      intensity: extraIntensity ?? liveExtras.intensity,
    };
    const parsedAreas = uniqueAreas(
      [...areaSpansFrom(nextAreas), ...parseAreas(nextDraft, maxAreas)],
      maxAreas,
    );
    return {
      areas: parsedAreas,
      duration:
        field === 'area' ? extras.duration : (duration ?? parseDuration(nextDraft)?.duration),
      intensity:
        field === 'area'
          ? extras.intensity
          : (intensity ?? parseIntensity(nextDraft, false)?.intensity),
      text:
        field === 'area'
          ? parsedAreas.join(', ')
          : field === 'duration'
            ? (duration ?? parseDuration(nextDraft)?.duration ?? nextDraft)
            : String(intensity ?? parseIntensity(nextDraft, false)?.intensity ?? nextDraft),
    };
  }

  function absorb(next: string) {
    if (field === 'area') {
      const spans = parseAreas(next, maxAreas - areas.length);
      const extras = parseExtras(next);
      if (extras.duration) setExtraDuration(extras.duration);
      if (extras.intensity != null) setExtraIntensity(extras.intensity);
      const ambiguous = spans.find((span) => span.alternatives);
      if (ambiguous?.alternatives) {
        setChoices(ambiguous);
        setDraft(next);
        return;
      }
      if (spans.length === 0) {
        setDraft(next);
        return;
      }
      setAreas((current) =>
        uniqueAreas([...areaSpansFrom(current), ...spans], maxAreas),
      );
      setDraft('');
      setChoices(null);
      return;
    }

    if (field === 'duration') {
      const span = parseDuration(next);
      if (!span) {
        setDraft(next);
        return;
      }
      setDuration(span.duration);
      setDraft('');
      return;
    }

    const span = parseIntensity(next, false);
    if (!span) {
      setDraft(next);
      return;
    }
    setIntensity(span.intensity);
    setDraft('');
  }

  commitRef.current = () => {
    const payload = snapshot();
    return payloadReady(field, payload) ? payload : null;
  };

  const ready = payloadReady(field, snapshot());
  useEffect(() => {
    onReadyChange(ready);
  }, [ready, onReadyChange]);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {filled.map((item) => (
        <Pill
          key={item}
          onClick={() => {
            if (field === 'area') {
              setAreas((current) => current.filter((area) => area !== item));
            } else if (field === 'duration') {
              setDuration(null);
            } else {
              setIntensity(null);
            }
          }}
        >
          {item}
        </Pill>
      ))}
      {showSlot ? (
        <SlotInput
          inputRef={inputRef}
          placeholder={emptyLabel(field, filled.length)}
          ghost={field === 'area' && areas.length > 0}
          value={draft}
          onChange={absorb}
          onSubmit={onSubmit}
        />
      ) : null}
      {choices?.alternatives
        ? choices.alternatives.map((area) => (
            <Pill
              key={area}
              onClick={() => {
                setAreas((current) =>
                  uniqueAreas(
                    [...areaSpansFrom(current), { ...choices, area, alternatives: undefined }],
                    maxAreas,
                  ),
                );
                setDraft('');
                setChoices(null);
              }}
            >
              {area}
            </Pill>
          ))
        : null}
    </div>
  );
}

function WrapComposer({
  field,
  maxAreas,
  seed,
  commitRef,
  onReadyChange,
  onSubmit,
}: {
  field: IntakeField;
  maxAreas: number;
  seed: string;
  commitRef: RefObject<(() => CommitPayload | null) | null>;
  onReadyChange: (ready: boolean) => void;
  onSubmit: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [pending, setPending] = useState('');
  const [choices, setChoices] = useState<AreaSpan | null>(null);

  const full = `${value}${pending}`;
  const spans = useMemo(
    () => parseField(value, field, maxAreas) as IntakeSpan[],
    [value, field, maxAreas],
  );
  const parts = useMemo(() => serializeSpans(value, spans), [value, spans]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!seed) return;
    const next = full ? `${full.trimEnd()} ${seed}` : seed;
    setValue(next.endsWith(' ') ? next : `${next} `);
    setPending('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  function payloadFrom(nextValue: string, nextPending: string): CommitPayload {
    const text = `${nextValue}${nextPending}`.replace(/\s+/g, ' ').trim();
    const extras = parseExtras(text);
    return {
      areas: parseAreas(text, maxAreas).map((span) => span.area),
      duration: field === 'area' ? extras.duration : parseDuration(text)?.duration,
      intensity:
        field === 'area'
          ? extras.intensity
          : parseIntensity(text, false)?.intensity,
      text,
    };
  }

  commitRef.current = () => {
    const payload = payloadFrom(value, pending);
    return payloadReady(field, payload) ? payload : null;
  };

  const ready = payloadReady(field, payloadFrom(value, pending));
  useEffect(() => {
    onReadyChange(ready);
  }, [ready, onReadyChange]);

  function handlePending(next: string) {
    if (/\s|[.,!?;]/.test(next)) {
      const joined = `${value}${next.replace(/\s+/g, ' ')}`;
      setValue(joined.endsWith(' ') ? joined : `${joined} `);
      setPending('');
      setChoices(
        parseAreas(joined, maxAreas).find((span) => span.alternatives) ?? null,
      );
      return;
    }

    const live = liveWrapPending(next, field);
    if (live) {
      setValue(`${value}${next} `);
      setPending('');
      if (live.kind === 'area' && live.alternatives) setChoices(live);
      return;
    }

    setPending(next);
  }

  function handleBackspace() {
    if (pending.length > 0) return false;
    const last = parts.at(-1);
    if (last?.type === 'pill') {
      setValue(value.slice(0, last.span.start) + value.slice(last.span.end));
      return true;
    }
    const word = value.match(/(\S+)\s*$/);
    if (word && word.index != null) {
      setValue(value.slice(0, word.index));
      setPending(word[1] ?? '');
      return true;
    }
    if (!value) return false;
    setValue('');
    return true;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline gap-x-1 gap-y-1.5">
        {parts.map((part, index) =>
          part.type === 'pill' ? (
            <Pill
              key={`${part.span.start}-${part.span.end}-${index}`}
              onClick={() => {
                if (part.span.kind === 'area' && part.span.alternatives) {
                  setChoices(part.span);
                  return;
                }
                setValue(value.slice(0, part.span.start) + value.slice(part.span.end));
              }}
            >
              {pillLabel(part.span)}
            </Pill>
          ) : (
            <span
              key={`text-${index}`}
              className="text-title-medium-strong text-foreground-neutral-default whitespace-pre-wrap font-serif tracking-[-0.03em]"
            >
              {part.text}
            </span>
          ),
        )}
        <input
          ref={inputRef}
          value={pending}
          onChange={(event) => handlePending(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onSubmit();
            }
            if (event.key === 'Backspace' && pending === '') {
              if (handleBackspace()) event.preventDefault();
            }
          }}
          aria-label="Your answer"
          className="text-title-medium-strong text-foreground-neutral-default min-w-[8ch] flex-1 bg-transparent font-serif tracking-[-0.03em] outline-none"
        />
      </div>
      {choices?.alternatives ? (
        <div className="flex flex-wrap gap-1.5">
          {choices.alternatives.map((area) => (
            <Pill
              key={area}
              onClick={() => {
                setValue(
                  `${value.slice(0, choices.start)}${area}${value.slice(choices.end)}`,
                );
                setChoices(null);
              }}
            >
              {area}
            </Pill>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function IntakeComposer({
  mode,
  field,
  maxAreas,
  onCommitAreas,
  onCommitDuration,
  onCommitIntensity,
}: {
  mode: ComposerMode;
  field: IntakeField;
  maxAreas: number;
  onCommitAreas: (areas: string[], meta: AreaCommitMeta) => void;
  onCommitDuration: (duration: string, text?: string) => void;
  onCommitIntensity: (intensity: number, text?: string) => void;
}) {
  const commitRef = useRef<(() => CommitPayload | null) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [seed, setSeed] = useState('');
  const seedCount = useRef(0);

  const mic = useMic((transcript) => {
    seedCount.current += 1;
    setSeed(`${seedCount.current}:${transcript}`);
  });

  const seedText = seed.includes(':') ? seed.slice(seed.indexOf(':') + 1) : '';

  function publish(payload: CommitPayload) {
    if (field === 'area') {
      onCommitAreas(payload.areas, {
        text: payload.text,
        duration: payload.duration,
        intensity: payload.intensity,
      });
      return;
    }
    if (field === 'duration' && payload.duration) {
      onCommitDuration(payload.duration, payload.text);
      return;
    }
    if (payload.intensity != null) {
      onCommitIntensity(payload.intensity, payload.text);
    }
  }

  function submit() {
    const payload = commitRef.current?.() ?? null;
    if (!payload || !payloadReady(field, payload)) {
      setError(missHint(field));
      return;
    }
    setError(null);
    publish(payload);
  }

  const composerProps = {
    field,
    maxAreas,
    seed: seedText,
    commitRef,
    onReadyChange: setCanSubmit,
    onSubmit: submit,
  };

  return (
    <div data-intake-composer className="flex select-text flex-col gap-2 pb-1">
      <div className="flex items-start gap-1">
        <div className="min-w-0 flex-1 pt-1">
          {mode === 'slot' ? (
            <SlotComposer {...composerProps} />
          ) : (
            <WrapComposer {...composerProps} />
          )}
        </div>
        <div className="flex shrink-0">
          {mic.hasSpeech ? (
            <IconButton
              label={mic.listening ? 'Stop listening' : 'Speak'}
              pressed={mic.listening}
              onClick={mic.toggle}
            >
              <Mic className="size-4" />
            </IconButton>
          ) : null}
          <IconButton
            label="Send"
            send
            disabled={!canSubmit}
            onClick={submit}
          >
            <ArrowUp className="size-4" />
          </IconButton>
        </div>
      </div>
      <p className="text-body-small-subtle text-foreground-neutral-faded">
        {error ?? (mode === 'wrap' ? hintFor(field) : '\u00a0')}
      </p>
    </div>
  );
}
