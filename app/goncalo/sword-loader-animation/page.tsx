'use client';

import { FoldingMark } from '@/app/goncalo/sword-loader-animation/folding-mark';
import { Button } from '@/design/components/button';
import { useEffect, useRef, useState } from 'react';

const SIZES = [
  { label: 'sm', width: 48 },
  { label: 'md', width: 72 },
  { label: 'lg', width: 104 },
] as const;

export default function SwordLoaderAnimation() {
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [slow, setSlow] = useState(false);
  const phaseRef = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) return;
    phaseRef.current = 0;
    setPhase(0);
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = performance.now();
    const duration = slow ? 11600 : 4000;

    const tick = (now: number) => {
      phaseRef.current = (phaseRef.current + (now - last) / duration) % 1;
      last = now;
      setPhase(phaseRef.current);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, slow]);

  function scrub(next: number) {
    phaseRef.current = next;
    setPhase(next);
    setPlaying(false);
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-14 px-6 py-16">
      <FoldingMark width={200} phase={phase} title="Sword mark, circle rising into the ring" />
      <div className="flex items-end justify-center gap-14">
        {SIZES.map((size) => (
          <div key={size.label} className="flex flex-col items-center gap-3">
            <FoldingMark
              width={size.width}
              phase={phase}
              title={`Sword mark, circle rising into the ring, ${size.label}`}
            />
            <span className="text-body-medium-strong">{size.label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          variant="solid"
          size="small"
          onClick={() => setPlaying((value) => !value)}
        >
          {playing ? 'Pause' : 'Play'}
        </Button>
        <Button
          type="button"
          variant={slow ? 'solid' : 'ghost'}
          size="small"
          aria-pressed={slow}
          onClick={() => setSlow((value) => !value)}
        >
          Slow
        </Button>
        <label className="text-body-medium-default flex items-center gap-3">
          Cycle
          <input
            type="range"
            min={0}
            max={1000}
            step={1}
            value={Math.round(phase * 1000)}
            aria-valuetext={`${Math.round(phase * 100)} percent`}
            onChange={(event) => scrub(Number(event.target.value) / 1000)}
          />
        </label>
      </div>
    </main>
  );
}
