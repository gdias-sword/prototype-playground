'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { gradientThemes, type GradientTheme } from './gradient-themes';

type Circle = {
  name: string;
  stop: 1 | 2 | 3;
  left: string;
  bottom: string;
  size: string;
  blur: string;
};

export const gradientConfigurations = {
  center: [
    {
      name: 'blue',
      stop: 3,
      left: '60vw',
      bottom: 'calc(10vh - 40vw)',
      size: '80vw',
      blur: '80px',
    },
    {
      name: 'purple',
      stop: 2,
      left: '40vw',
      bottom: 'calc(10vh - 20vw)',
      size: '40vw',
      blur: '80px',
    },
    {
      name: 'red',
      stop: 1,
      left: '20vw',
      bottom: 'calc(10vh - 30vw)',
      size: '60vw',
      blur: '80px',
    },
  ],
  edge: [
    {
      name: 'red-left',
      stop: 1,
      left: '0vw',
      bottom: 'calc(clamp(0vh, 20vw, 20vh) - 20vw)',
      size: '40vw',
      blur: '80px',
    },
    {
      name: 'purple-left',
      stop: 2,
      left: '20vw',
      bottom: 'calc(clamp(0vh, 10vw, 10vh) - 20vw)',
      size: '40vw',
      blur: '80px',
    },
    {
      name: 'blue-left',
      stop: 3,
      left: '40vw',
      bottom: 'calc(0vh - 20vw)',
      size: '40vw',
      blur: '80px',
    },
    {
      name: 'red-right',
      stop: 1,
      left: '60vw',
      bottom: 'calc(0vh - 20vw)',
      size: '40vw',
      blur: '80px',
    },
    {
      name: 'purple-right',
      stop: 2,
      left: '80vw',
      bottom: 'calc(clamp(0vh, 10vw, 10vh) - 20vw)',
      size: '40vw',
      blur: '80px',
    },
    {
      name: 'blue-right',
      stop: 3,
      left: '100vw',
      bottom: 'calc(clamp(0vh, 20vw, 20vh) - 20vw)',
      size: '40vw',
      blur: '80px',
    },
  ],
} as const satisfies Record<string, readonly Circle[]>;

export type GradientConfiguration = keyof typeof gradientConfigurations;

const configurationLabels: Record<GradientConfiguration, string> = {
  center: 'Center',
  edge: 'Edge',
};

const stopColor = {
  1: 'stop1',
  2: 'stop2',
  3: 'stop3',
} as const;

export function DiffuseGradient({
  theme,
  onThemeChange,
}: {
  theme: GradientTheme;
  onThemeChange: (theme: GradientTheme) => void;
}) {
  const [configuration, setConfiguration] =
    useState<GradientConfiguration>('edge');
  const circles = gradientConfigurations[configuration];
  const stops = gradientThemes[theme];

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute inset-0">
          {circles.map((circle) => (
            <div
              key={circle.name}
              className="absolute rounded-full"
              style={{
                width: circle.size,
                height: circle.size,
                left: circle.left,
                bottom: circle.bottom,
                transform: 'translate(-50%, 50%)',
                backgroundColor: stops[stopColor[circle.stop]],
                filter: `blur(${circle.blur})`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="fixed top-5 left-1/2 z-30 flex max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-2">
        <label className="relative">
          <span className="sr-only">Theme</span>
          <select
            value={theme}
            onChange={(event) =>
              onThemeChange(event.target.value as GradientTheme)
            }
            className="h-11 cursor-pointer appearance-none rounded-2xl border border-[#e2e2e2] bg-white/90 py-0 pr-10 pl-4 text-[14px] leading-5 font-semibold tracking-[0.2px] text-[#0d0d0d] shadow-[0_8px_24px_rgba(13,13,13,0.08)] backdrop-blur-md transition-[border-color,box-shadow] outline-none focus:border-[#0d0d0d] focus:ring-3 focus:ring-[#0d0d0d]/10"
          >
            {(Object.keys(gradientThemes) as GradientTheme[]).map((name) => (
              <option key={name} value={name}>
                {gradientThemes[name].label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-[#0d0d0d]"
            strokeWidth={1.75}
          />
        </label>

        <div className="flex items-center gap-1 rounded-2xl border border-[#e2e2e2] bg-white/90 p-1 shadow-[0_8px_24px_rgba(13,13,13,0.08)] backdrop-blur-md">
          {(Object.keys(gradientConfigurations) as GradientConfiguration[]).map(
            (name) => {
              const selected = name === configuration;

              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setConfiguration(name)}
                  className={`h-9 cursor-pointer rounded-xl px-4 text-[14px] leading-5 font-semibold tracking-[0.2px] transition-colors ${
                    selected
                      ? 'bg-[#0d0d0d] text-white'
                      : 'text-[#2e2e2e] hover:bg-[#f2f2f2]'
                  }`}
                >
                  {configurationLabels[name]}
                </button>
              );
            },
          )}
        </div>
      </div>
    </>
  );
}
