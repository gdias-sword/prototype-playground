'use client';

import { useState } from 'react';

type Circle = {
  name: string;
  color: string;
  left: string;
  bottom: string;
  size: string;
  blur: string;
};

export const gradientConfigurations = {
  center: [
    {
      name: 'blue',
      color: 'var(--gradient-primary-stop-3)',
      left: '60vw',
      bottom: 'calc(10vh - 40vw)',
      size: '80vw',
      blur: '80px',
    },
    {
      name: 'purple',
      color: 'var(--gradient-primary-stop-2)',
      left: '40vw',
      bottom: 'calc(10vh - 20vw)',
      size: '40vw',
      blur: '80px',
    },
    {
      name: 'red',
      color: 'var(--gradient-primary-stop-1)',
      left: '20vw',
      bottom: 'calc(10vh - 30vw)',
      size: '60vw',
      blur: '80px',
    },
  ],
  edge: [
    {
      name: 'red-left',
      color: 'var(--gradient-primary-stop-1)',
      left: '0vw',
      bottom: 'calc(clamp(0vh, 20vw, 20vh) - 20vw)',
      size: '40vw',
      blur: '80px',
    },
    {
      name: 'purple-left',
      color: 'var(--gradient-primary-stop-2)',
      left: '20vw',
      bottom: 'calc(clamp(0vh, 10vw, 10vh) - 20vw)',
      size: '40vw',
      blur: '80px',
    },
    {
      name: 'blue-left',
      color: 'var(--gradient-primary-stop-3)',
      left: '40vw',
      bottom: 'calc(0vh - 20vw)',
      size: '40vw',
      blur: '80px',
    },
    {
      name: 'red-right',
      color: 'var(--gradient-primary-stop-1)',
      left: '60vw',
      bottom: 'calc(0vh - 20vw)',
      size: '40vw',
      blur: '80px',
    },
    {
      name: 'purple-right',
      color: 'var(--gradient-primary-stop-2)',
      left: '80vw',
      bottom: 'calc(clamp(0vh, 10vw, 10vh) - 20vw)',
      size: '40vw',
      blur: '80px',
    },
    {
      name: 'blue-right',
      color: 'var(--gradient-primary-stop-3)',
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

export function DiffuseGradient() {
  const [configuration, setConfiguration] =
    useState<GradientConfiguration>('edge');
  const circles = gradientConfigurations[configuration];

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
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
                backgroundColor: circle.color,
                filter: `blur(${circle.blur})`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="fixed top-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-[#e2e2e2] bg-white/90 p-1 shadow-[0_8px_24px_rgba(13,13,13,0.08)] backdrop-blur-md">
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
    </>
  );
}
