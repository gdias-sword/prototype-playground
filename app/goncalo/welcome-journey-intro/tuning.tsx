'use client';

import { cn } from '@/design/utils';
import { RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export interface Tuning {
  stepDuration: number;
  stepDistance: number;
  headerDelay: number;
  contentDelay: number;
  footerDelay: number;
  textReveal: 'lines' | 'words';
  lineStagger: number;
  wordStagger: number;
  readStart: number;
  readSpeed: number;
  secondLineAt: number;
  settleAt: number;
  moveDuration: number;
  stepsStart: number;
  rowStagger: number;
  continueDelay: number;
}

const DEFAULTS: Tuning = {
  stepDuration: 1.2,
  stepDistance: 40,
  headerDelay: 0.2,
  contentDelay: 0.6,
  footerDelay: 1.2,
  textReveal: 'lines',
  lineStagger: 0.15,
  wordStagger: 0.06,
  readStart: 0.7,
  readSpeed: 0.11,
  secondLineAt: 3.2,
  settleAt: 7,
  moveDuration: 1,
  stepsStart: 0.45,
  rowStagger: 0.25,
  continueDelay: 1.3,
};

type NumberKey = Exclude<keyof Tuning, 'textReveal'>;

interface Control {
  key: NumberKey;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

const GROUPS: { title: string; controls: Control[] }[] = [
  {
    title: 'Step screens',
    controls: [
      {
        key: 'stepDuration',
        label: 'Duration',
        min: 0.1,
        max: 2,
        step: 0.05,
        unit: 's',
      },
      {
        key: 'stepDistance',
        label: 'Rise distance',
        min: 0,
        max: 64,
        step: 2,
        unit: 'px',
      },
      {
        key: 'headerDelay',
        label: 'Sub-header delay',
        min: 0,
        max: 1.5,
        step: 0.05,
        unit: 's',
      },
      {
        key: 'contentDelay',
        label: 'Content delay',
        min: 0,
        max: 1.5,
        step: 0.05,
        unit: 's',
      },
      {
        key: 'footerDelay',
        label: 'Footer delay',
        min: 0,
        max: 1.5,
        step: 0.05,
        unit: 's',
      },
    ],
  },
  {
    title: 'Welcome text',
    controls: [
      {
        key: 'lineStagger',
        label: 'Line stagger',
        min: 0,
        max: 0.6,
        step: 0.01,
        unit: 's',
      },
      {
        key: 'wordStagger',
        label: 'Word stagger',
        min: 0,
        max: 0.3,
        step: 0.01,
        unit: 's',
      },
      {
        key: 'readStart',
        label: 'Reading starts',
        min: 0,
        max: 3,
        step: 0.05,
        unit: 's',
      },
      {
        key: 'readSpeed',
        label: 'Reading pace',
        min: 0.02,
        max: 0.4,
        step: 0.01,
        unit: 's/word',
      },
      {
        key: 'secondLineAt',
        label: 'Second line at',
        min: 1,
        max: 8,
        step: 0.1,
        unit: 's',
      },
      {
        key: 'settleAt',
        label: 'Move up at',
        min: 2,
        max: 14,
        step: 0.1,
        unit: 's',
      },
      {
        key: 'moveDuration',
        label: 'Move duration',
        min: 0.2,
        max: 3,
        step: 0.05,
        unit: 's',
      },
    ],
  },
  {
    title: 'Welcome steps',
    controls: [
      {
        key: 'stepsStart',
        label: 'Steps start',
        min: 0,
        max: 2,
        step: 0.05,
        unit: 's',
      },
      {
        key: 'rowStagger',
        label: 'Row stagger',
        min: 0,
        max: 1,
        step: 0.05,
        unit: 's',
      },
      {
        key: 'continueDelay',
        label: 'Continue delay',
        min: 0,
        max: 4,
        step: 0.05,
        unit: 's',
      },
    ],
  },
];

const STORAGE_KEY = 'welcome-journey-intro:tuning';

const TuningContext = createContext<{
  tuning: Tuning;
  setTuning: (tuning: Tuning) => void;
}>({ tuning: DEFAULTS, setTuning: () => {} });

export function useTuning() {
  return useContext(TuningContext).tuning;
}

export function TuningProvider({ children }: { children: ReactNode }) {
  const [tuning, setTuning] = useState(DEFAULTS);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setTuning({ ...DEFAULTS, ...JSON.parse(stored) });
  }, []);

  function handleChange(next: Tuning) {
    setTuning(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return (
    <TuningContext.Provider value={{ tuning, setTuning: handleChange }}>
      {children}
    </TuningContext.Provider>
  );
}

export function TuningPanel({ onReplay }: { onReplay: () => void }) {
  const { tuning, setTuning } = useContext(TuningContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isAutoReplay, setIsAutoReplay] = useState(true);
  const timer = useRef(0);

  function handleChange(next: Tuning) {
    setTuning(next);
    if (!isAutoReplay) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(onReplay, 400);
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed right-6 bottom-6 z-50 flex h-10 cursor-pointer items-center gap-2 rounded-full bg-[#1f222c]/90 px-4 text-[13px] font-semibold text-white shadow-[0_8px_28px_rgba(0,0,0,0.22)] backdrop-blur-xl max-lg:bottom-40"
      >
        <SlidersHorizontal className="size-4" />
        Motion
      </button>
    );
  }

  return (
    <div className="fixed right-6 bottom-6 z-50 flex max-h-[calc(100dvh-48px)] w-[300px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1f222c]/92 text-white shadow-[0_8px_28px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="flex items-center gap-1 border-b border-white/10 px-4 py-2">
        <p className="flex-1 text-[13px] font-semibold">Motion</p>
        <button
          type="button"
          onClick={onReplay}
          className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-[12px] hover:bg-white/10"
        >
          <RotateCcw className="size-3.5" />
          Replay
        </button>
        <button
          type="button"
          aria-label="Close motion controls"
          onClick={() => setIsOpen(false)}
          className="flex size-8 cursor-pointer items-center justify-center rounded-lg hover:bg-white/10"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="flex flex-col gap-5 overflow-y-auto px-4 py-4">
        {GROUPS.map((group) => (
          <section key={group.title} className="flex flex-col gap-3">
            <h2 className="text-[11px] font-semibold tracking-[0.6px] text-white/50 uppercase">
              {group.title}
            </h2>
            {group.title === 'Welcome text' && (
              <div className="flex rounded-lg bg-white/8 p-0.5 text-[12px]">
                {(['lines', 'words'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() =>
                      handleChange({ ...tuning, textReveal: mode })
                    }
                    className={cn(
                      'h-7 flex-1 cursor-pointer rounded-md capitalize',
                      tuning.textReveal === mode
                        ? 'bg-white/16 font-semibold'
                        : 'text-white/60 hover:text-white',
                    )}
                  >
                    {mode === 'lines' ? 'Lines rise in' : 'Words fade in'}
                  </button>
                ))}
              </div>
            )}
            {group.controls.map((control) => (
              <label key={control.key} className="flex flex-col gap-1.5">
                <span className="flex items-center justify-between text-[12px]">
                  <span
                    className={cn(
                      tuning[control.key] !== DEFAULTS[control.key] &&
                        'text-[#8db6f2]',
                    )}
                  >
                    {control.label}
                  </span>
                  <span className="text-white/60 tabular-nums">
                    {tuning[control.key]}
                    {control.unit}
                  </span>
                </span>
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={tuning[control.key]}
                  onChange={(event) =>
                    handleChange({
                      ...tuning,
                      [control.key]: Number(event.target.value),
                    })
                  }
                  className="h-1 w-full cursor-pointer accent-[#4a89e8]"
                />
              </label>
            ))}
          </section>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-white/10 px-4 py-2 text-[12px]">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={isAutoReplay}
            onChange={(event) => setIsAutoReplay(event.target.checked)}
            className="accent-[#4a89e8]"
          />
          Replay on change
        </label>
        <button
          type="button"
          onClick={() => handleChange(DEFAULTS)}
          className="h-8 cursor-pointer rounded-lg px-2 hover:bg-white/10"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
