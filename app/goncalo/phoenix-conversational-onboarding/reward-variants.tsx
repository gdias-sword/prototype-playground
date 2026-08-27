'use client';

// Variants:
// A — press-and-hold a folded-light parcel; the reward bursts into the world
// B — unlock a glass seal; the reward moves from protected to owned
// C — feed three session traces into Phoenix; effort transforms into equipment
// D — initiate a cinematic turntable reveal; the reward is treated like a prize object

import { Button } from '@/design/components/button';
import { mergeTailwindClasses as cn } from '@/design/utils';
import { Gift, LockKeyhole, Sparkles } from 'lucide-react';
import Image, { type StaticImageData } from 'next/image';
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import bandHeavy from './assets/band-heavy-cutout.png';
import bandLight from './assets/band-light-cutout.png';
import bandMedium from './assets/band-medium-cutout.png';
import bandsGroup from './assets/bands-group-cutout.png';
import { HomeIndicator, StatusBar } from './device-frame';
import { PhoenixOrb } from './phoenix-orb';
import { WorldBackdrop } from './world-scene';

type RewardVariantProps = {
  onContinue: () => void;
};

function ProductImage({
  src,
  alt,
  className,
  priority,
}: {
  src: StaticImageData;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      priority={priority}
      className={cn('pointer-events-none h-auto w-full select-none', className)}
    />
  );
}

function RewardCopy({
  visible,
  onContinue,
  className,
}: {
  visible: boolean;
  onContinue: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'reward-copy text-center',
        visible && 'reward-copy-visible',
        className,
      )}
      aria-hidden={!visible}
    >
      <h1 className="text-display-small-strong text-foreground-neutral-default font-serif tracking-[-0.04em]">
        You&apos;ve earned a reward!
      </h1>
      <p className="text-body-large-default text-foreground-neutral-strong mx-auto mt-2 max-w-[320px]">
        Nice work completing your first session. Your resistance bands are on
        the way.
      </p>
      <Button
        variant="solid"
        size="large"
        onClick={onContinue}
        tabIndex={visible ? 0 : -1}
        className="bg-background-neutral-inverse hover:bg-background-neutral-inverse/90 mt-5 h-12 w-full rounded-2xl"
      >
        Continue
      </Button>
    </div>
  );
}

function useHoldToReveal(onReveal: () => void) {
  const [progress, setProgress] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const completeRef = useRef(false);

  function stop(reset = true) {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    if (reset && !completeRef.current) setProgress(0);
  }

  function start() {
    if (completeRef.current) return;
    stop(false);
    startedAtRef.current = performance.now();

    function tick(now: number) {
      const next = Math.min((now - startedAtRef.current) / 1050, 1);
      setProgress(next);
      if (next >= 1) {
        completeRef.current = true;
        frameRef.current = null;
        onReveal();
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => () => stop(false), []);
  return { progress, start, stop };
}

export function VariantA({ onContinue }: RewardVariantProps) {
  const [revealed, setRevealed] = useState(false);
  const { progress, start, stop } = useHoldToReveal(() => setRevealed(true));

  return (
    <div className="bg-background-neutral-default relative flex h-full flex-col overflow-hidden">
      <WorldBackdrop />
      <div className="reward-light-sweep pointer-events-none absolute inset-0" />
      <StatusBar />
      <main className="relative z-10 flex min-h-0 flex-1 flex-col px-4">
        <div className="pt-6 text-center">
          <p className="text-body-medium-strong text-foreground-brand-default">
            First session complete
          </p>
          <p className="text-body-medium-default text-foreground-neutral-faded mt-1">
            Phoenix has something for you
          </p>
        </div>

        <div className="relative mt-5 h-[350px]">
          <div
            className={cn(
              'reward-parcel absolute top-7 left-1/2 h-[248px] w-[248px] -translate-x-1/2',
              revealed && 'reward-parcel-open',
            )}
          >
            <div className="reward-parcel-halo" />
            <div className="reward-parcel-half reward-parcel-left" />
            <div className="reward-parcel-half reward-parcel-right" />
            <div className="reward-parcel-ribbon" />
            <Gift className="reward-parcel-icon size-8" strokeWidth={1.7} />
          </div>

          <div
            className={cn(
              'reward-band-burst absolute top-[-18px] left-1/2 w-[330px]',
              revealed && 'reward-band-burst-visible',
            )}
          >
            <ProductImage
              src={bandsGroup}
              alt="Light, medium, and heavy resistance bands"
              priority
            />
          </div>

          {Array.from({ length: 8 }).map((_, index) => (
            <span
              key={index}
              className={cn(
                'reward-light-fragment',
                revealed && 'reward-light-fragment-visible',
              )}
              style={{ '--fragment-index': index } as CSSProperties}
            />
          ))}

          {!revealed && (
            <button
              type="button"
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                start();
              }}
              onPointerUp={() => stop()}
              onPointerCancel={() => stop()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') start();
              }}
              onKeyUp={(event) => {
                if (event.key === 'Enter' || event.key === ' ') stop();
              }}
              className="reward-hold-control text-body-medium-strong text-foreground-neutral-strong absolute bottom-0 left-1/2 flex h-12 w-[210px] -translate-x-1/2 cursor-pointer items-center justify-center rounded-full p-0.5 shadow-[0_12px_42px_rgba(76,72,140,0.12)]"
              style={{ '--hold-progress': 0.45 } as CSSProperties}
            >
              <span className="bg-background-neutral-default flex h-full w-full items-center justify-center rounded-full">
                Hold to unwrap
              </span>
            </button>
          )}
        </div>

        <RewardCopy
          visible={revealed}
          onContinue={onContinue}
          className="mt-auto pb-1"
        />
      </main>
      <HomeIndicator />
    </div>
  );
}

export function VariantB({ onContinue }: RewardVariantProps) {
  const [revealed, setRevealed] = useState(false);
  const [selectedBand, setSelectedBand] = useState<number | null>(null);
  const bands = [
    { src: bandLight, label: 'Light', className: '-rotate-[18deg]' },
    { src: bandMedium, label: 'Medium', className: 'rotate-[7deg]' },
    { src: bandHeavy, label: 'Heavy', className: 'rotate-[18deg]' },
  ];

  return (
    <div className="bg-background-neutral-default relative flex h-full flex-col overflow-hidden">
      <WorldBackdrop />
      <StatusBar />
      <main className="relative z-10 flex min-h-0 flex-1 flex-col px-4">
        <div className="pt-5 text-center">
          <p className="text-body-medium-strong text-foreground-brand-default">
            A milestone, made tangible
          </p>
          <h1 className="text-title-large-strong text-foreground-neutral-default mt-1 font-serif tracking-[-0.035em]">
            Your first-session reward
          </h1>
        </div>

        <div className="relative mt-4 h-[386px]">
          <div
            className={cn(
              'reward-seal absolute top-3 left-1/2 size-[304px] -translate-x-1/2',
              revealed && 'reward-seal-open',
            )}
          >
            <div className="reward-seal-aura" />
            <div className="reward-seal-shell" />
            <div className="reward-seal-ring reward-seal-ring-one" />
            <div className="reward-seal-ring reward-seal-ring-two" />
            <div className="reward-seal-product">
              <ProductImage
                src={bandsGroup}
                alt="Three resistance bands inside a glass seal"
                priority
              />
            </div>
            <LockKeyhole
              className="reward-seal-lock size-7"
              strokeWidth={1.6}
            />
          </div>

          {revealed && (
            <div className="absolute inset-x-2 bottom-0 flex justify-center gap-2">
              {bands.map((band, index) => (
                <button
                  key={band.label}
                  type="button"
                  onClick={() =>
                    setSelectedBand(selectedBand === index ? null : index)
                  }
                  className={cn(
                    'reward-band-chip relative h-[86px] w-[92px] cursor-pointer overflow-hidden rounded-[22px] border border-white/80 bg-white/50 shadow-[0_10px_30px_rgba(70,70,130,0.08)] backdrop-blur-xl',
                    selectedBand === index && 'reward-band-chip-selected',
                  )}
                >
                  <ProductImage
                    src={band.src}
                    alt={`${band.label} resistance band`}
                    className={cn(
                      'absolute top-[-28px] left-1/2 w-[96px] -translate-x-1/2',
                      band.className,
                    )}
                  />
                  <span className="text-body-small-subtle text-foreground-neutral-strong absolute inset-x-0 bottom-2">
                    {band.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {!revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="text-body-large-strong text-foreground-neutral-strong mx-auto mt-auto mb-1 flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-white/80 bg-white/58 shadow-[0_14px_44px_rgba(80,70,150,0.13)] backdrop-blur-2xl transition-transform active:scale-[0.98]"
          >
            <LockKeyhole className="size-4" />
            Unlock my bands
          </button>
        ) : (
          <RewardCopy
            visible
            onContinue={onContinue}
            className="mt-auto pb-1"
          />
        )}
      </main>
      <HomeIndicator />
    </div>
  );
}

function SessionTrace({
  index,
  collected,
  onCollect,
}: {
  index: number;
  collected: boolean;
  onCollect: () => void;
}) {
  const labels = ['Balance', 'Control', 'Strength'];
  return (
    <button
      type="button"
      onClick={onCollect}
      disabled={collected}
      className={cn(
        'reward-session-trace text-body-small-subtle text-foreground-neutral-strong absolute flex h-10 items-center gap-2 rounded-full border border-white/80 bg-white/54 px-3 shadow-[0_8px_24px_rgba(80,70,140,0.1)] backdrop-blur-xl',
        collected && 'reward-session-trace-collected',
      )}
      style={{ '--trace-index': index } as CSSProperties}
    >
      <span className="size-2 rounded-full bg-[linear-gradient(135deg,#ff8b86,#779bf1)] shadow-[0_0_12px_rgba(114,142,235,0.6)]" />
      {labels[index]}
    </button>
  );
}

export function VariantC({ onContinue }: RewardVariantProps) {
  const [collected, setCollected] = useState<boolean[]>([false, false, false]);
  const count = collected.filter(Boolean).length;
  const revealed = count === 3;

  function collect(index: number) {
    setCollected((current) =>
      current.map((value, itemIndex) => value || itemIndex === index),
    );
  }

  return (
    <div className="bg-background-neutral-default relative flex h-full flex-col overflow-hidden">
      <WorldBackdrop />
      <StatusBar />
      <main className="relative z-10 flex min-h-0 flex-1 flex-col px-4">
        <div className="pt-5 text-center">
          <p className="text-body-medium-strong text-foreground-brand-default">
            Movement assessment complete
          </p>
          <h1 className="text-title-large-strong text-foreground-neutral-default mt-1 font-serif tracking-[-0.035em]">
            Bring your session into Phoenix
          </h1>
          <p className="text-body-medium-default text-foreground-neutral-faded mt-1">
            Tap each trace to make your progress tangible
          </p>
        </div>

        <div
          className={cn(
            'reward-energy-stage relative mt-3 h-[410px]',
            revealed && 'reward-energy-stage-revealed',
          )}
        >
          <div className="reward-energy-orb absolute top-[82px] left-1/2 size-[210px] -translate-x-1/2">
            <PhoenixOrb
              mood={revealed ? 'speak' : count > 0 ? 'think' : 'breath'}
            />
          </div>

          {[0, 1, 2].map((index) => (
            <SessionTrace
              key={index}
              index={index}
              collected={collected[index]}
              onCollect={() => collect(index)}
            />
          ))}

          <div className="reward-energy-band absolute top-[-10px] left-1/2 w-[340px]">
            <ProductImage
              src={bandsGroup}
              alt="Resistance bands formed from Phoenix energy"
              priority
            />
          </div>

          <div className="text-body-small-subtle text-foreground-neutral-faded absolute inset-x-0 bottom-2 text-center">
            {revealed ? 'Your effort became your equipment' : `${count} of 3`}
          </div>
        </div>

        <RewardCopy
          visible={revealed}
          onContinue={onContinue}
          className="mt-auto pb-1"
        />
      </main>
      <HomeIndicator />
    </div>
  );
}

export function VariantD({ onContinue }: RewardVariantProps) {
  const [revealed, setRevealed] = useState(false);
  const [rotation, setRotation] = useState(0);
  const dragRef = useRef<{ x: number; rotation: number } | null>(null);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!revealed) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, rotation };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    setRotation(
      dragRef.current.rotation + (event.clientX - dragRef.current.x) * 0.45,
    );
  }

  function stopDrag() {
    dragRef.current = null;
  }

  return (
    <div className="bg-background-neutral-default reward-showroom relative flex h-full flex-col overflow-hidden">
      <StatusBar />
      <main className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="px-4 pt-4 text-center">
          <p className="text-body-medium-strong text-foreground-brand-default">
            Your first-session prize
          </p>
          <p className="text-body-medium-default text-foreground-neutral-faded mt-1">
            You showed up. This is yours.
          </p>
        </div>

        <div
          className={cn(
            'reward-showroom-stage relative mt-2 h-[430px] touch-none overflow-hidden',
            revealed && 'reward-showroom-stage-revealed',
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
        >
          <div className="reward-showroom-horizon" />
          <div className="reward-showroom-turntable" />
          <div className="reward-showroom-beam" />
          <div
            className="reward-showroom-product absolute top-[-14px] left-1/2 w-[348px]"
            style={
              {
                '--showroom-rotation': `${rotation}deg`,
              } as CSSProperties
            }
          >
            <ProductImage
              src={bandsGroup}
              alt="Light, medium, and heavy resistance bands on a turntable"
              priority
            />
          </div>
          <div className="reward-showroom-veil" />
          <div className="reward-showroom-nameplate">
            <span>THRIVE SERIES</span>
            <strong>LIGHT · MEDIUM · HEAVY</strong>
          </div>
          {revealed && (
            <p className="text-body-small-subtle text-foreground-neutral-faded absolute inset-x-0 bottom-3 text-center">
              Drag to inspect
            </p>
          )}
        </div>

        {!revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="text-body-large-strong text-foreground-neutral-strong mx-4 mt-auto mb-1 flex h-14 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/85 bg-white/64 shadow-[0_14px_44px_rgba(80,70,150,0.12)] backdrop-blur-2xl transition-transform active:scale-[0.98]"
          >
            <Sparkles className="size-4" />
            Reveal my reward
          </button>
        ) : (
          <RewardCopy
            visible
            onContinue={onContinue}
            className="mx-4 mt-auto pb-1"
          />
        )}
      </main>
      <HomeIndicator />
    </div>
  );
}
