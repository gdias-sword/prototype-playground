'use client';

import { Button } from '@/design/components/button';
import { mergeTailwindClasses as cn } from '@/design/utils';
import { useEffect, useState, type CSSProperties } from 'react';
import bandHeavy from './assets/reward-band-heavy.png';
import bandLight from './assets/reward-band-light.png';
import bandMedium from './assets/reward-band-medium.png';
import rewardGlow from './assets/reward-glow.svg';
import rewardLockCard from './assets/reward-lock-card.svg';
import { HomeIndicatorSpace, StatusBar } from './device-frame';

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

type RewardBeat =
  'entering' | 'headline' | 'tap-ready' | 'opening' | 'revealed';

function timing(fastDemo: boolean, normal: number, fast: number) {
  return fastDemo ? fast : normal;
}

export function RewardRevealScene({
  fastDemo = false,
  onContinue,
}: {
  fastDemo?: boolean;
  onContinue: () => void;
}) {
  const [beat, setBeat] = useState<RewardBeat>('entering');
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    setBeat('entering');
    setOpened(false);
  }, [fastDemo]);

  useEffect(() => {
    const headlineId = window.setTimeout(
      () => setBeat('headline'),
      timing(fastDemo, 220, 80),
    );
    const tapReadyId = window.setTimeout(
      () => setBeat('tap-ready'),
      timing(fastDemo, 1220, 380),
    );
    return () => {
      window.clearTimeout(headlineId);
      window.clearTimeout(tapReadyId);
    };
  }, [fastDemo]);

  function handleReveal() {
    if (beat !== 'tap-ready' || opened) return;
    setOpened(true);
    setBeat('opening');
    window.setTimeout(() => setBeat('revealed'), timing(fastDemo, 520, 180));
  }

  const showHeadline = beat !== 'entering';
  const showPrize = beat === 'opening' || beat === 'revealed';
  const showCard = beat !== 'entering' && !showPrize;
  const showTapHint = beat === 'tap-ready';
  const showCta = beat === 'revealed';

  return (
    <div
      className={cn(
        'reward-scene-enter absolute inset-0 flex flex-col overflow-hidden',
        'bg-gradient-to-b from-[var(--color-blue-100)] to-[var(--color-blue-500)] to-[80%]',
      )}
    >
      <StatusBar light={false} />
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-6">
        <div className="flex flex-1 flex-col items-center justify-center">
          {showHeadline ? (
            <h1
              className={cn(
                'reward-headline-enter text-center font-serif font-medium tracking-[-0.04em] text-white',
                beat === 'revealed' || beat === 'opening'
                  ? 'text-display-small-strong'
                  : 'text-display-small-strong',
              )}
            >
              You&apos;ve earned
              <br />a reward!
            </h1>
          ) : (
            <div className="h-[104px]" aria-hidden />
          )}

          <div
            className={cn(
              'relative mt-8 flex h-[320px] w-full max-w-[320px] items-center justify-center',
              showCard && 'reward-card-stage-enter',
            )}
          >
            {showPrize ? (
              <>
                <div className="reward-glow-burst pointer-events-none absolute top-1/2 left-1/2 size-[500px]">
                  <img
                    alt=""
                    aria-hidden
                    src={assetSrc(rewardGlow)}
                    className="size-full"
                  />
                </div>
                <div className="relative size-[320px]">
                  <div
                    className="reward-band-pop absolute top-[18%] left-[8%] w-[108px]"
                    style={
                      {
                        '--band-from': 'translate(0, 24px)',
                        '--band-to': 'translate(0, 0)',
                        animationDelay: '0ms',
                      } as CSSProperties
                    }
                  >
                    <img
                      alt=""
                      src={assetSrc(bandLight)}
                      className="h-auto w-full"
                    />
                  </div>
                  <div
                    className="reward-band-pop absolute top-[-4%] left-[30%] w-[140px]"
                    style={
                      {
                        '--band-from': 'translate(0, 32px)',
                        '--band-to': 'translate(0, 0)',
                        animationDelay: '80ms',
                      } as CSSProperties
                    }
                  >
                    <img
                      alt=""
                      src={assetSrc(bandMedium)}
                      className="h-auto w-full rotate-[8deg]"
                    />
                  </div>
                  <div
                    className="reward-band-pop absolute top-[28%] right-[-2%] w-[118px]"
                    style={
                      {
                        '--band-from': 'translate(0, 28px)',
                        '--band-to': 'translate(0, 0)',
                        animationDelay: '140ms',
                      } as CSSProperties
                    }
                  >
                    <img
                      alt=""
                      src={assetSrc(bandHeavy)}
                      className="h-auto w-full -rotate-[12deg]"
                    />
                  </div>
                </div>
              </>
            ) : null}

            {showCard && !showPrize ? (
              <button
                type="button"
                onClick={handleReveal}
                className={cn(
                  'relative size-[280px] cursor-pointer border-0 bg-transparent p-0',
                  beat === 'tap-ready' && 'reward-lock-jiggle',
                )}
                aria-label="Tap to reveal your reward"
              >
                <img
                  alt=""
                  aria-hidden
                  src={assetSrc(rewardLockCard)}
                  className={cn('size-full', opened && 'reward-lock-open')}
                />
              </button>
            ) : null}
          </div>

          <div className="relative mt-2 h-8 w-full shrink-0">
            <p
              className={cn(
                'reward-tap-hint-shimmer absolute inset-x-0 top-0 text-center text-[24px] leading-[30px]',
                showTapHint
                  ? 'reward-tap-hint-enter'
                  : 'pointer-events-none opacity-0',
              )}
              inert={!showTapHint || undefined}
              aria-hidden={!showTapHint}
            >
              Tap to reveal
            </p>
            <p
              className={cn(
                'absolute inset-x-0 top-0 text-center text-[26px] leading-8 font-medium text-white',
                showPrize
                  ? 'reward-product-title-enter'
                  : 'pointer-events-none opacity-0',
              )}
              style={showPrize ? { animationDelay: '220ms' } : undefined}
              inert={!showPrize || undefined}
              aria-hidden={!showPrize}
            >
              Resistance Bands
            </p>
          </div>
        </div>

        <div className="w-full pt-4 pb-2">
          <div
            className={cn(
              showCta ? 'reward-cta-enter' : 'pointer-events-none opacity-0',
            )}
            inert={!showCta || undefined}
          >
            <Button
              variant="solid"
              size="large"
              onClick={onContinue}
              className="bg-background-neutral-faded text-foreground-neutral-default hover:bg-background-neutral-subtle h-12 w-full rounded-2xl"
            >
              Get my reward
            </Button>
          </div>
          <HomeIndicatorSpace />
        </div>
      </div>
    </div>
  );
}
