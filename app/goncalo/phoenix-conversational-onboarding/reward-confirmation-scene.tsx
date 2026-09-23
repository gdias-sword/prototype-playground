'use client';

import { PrimaryAction } from './extended-scenes';
import { kitOnTheWayHint, kitOnTheWayLine } from './script';

export function RewardConfirmationScene({
  onContinue,
}: {
  onContinue: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pt-5">
      <div className="flex max-w-[343px] flex-col gap-4 text-center">
        <h1
          className="reward-headline-enter text-foreground-neutral-default font-sans text-[32px] leading-[40px] font-medium tracking-[-0.01em]"
          style={{ animationDelay: '80ms' }}
        >
          {kitOnTheWayLine()}
        </h1>
        <p
          className="reward-headline-enter text-body-large-default text-foreground-neutral-default"
          style={{ animationDelay: '220ms' }}
        >
          {kitOnTheWayHint()}
        </p>
      </div>
      <div
        className="reward-headline-enter mt-auto w-full pt-4 pb-2"
        style={{ animationDelay: '360ms' }}
      >
        <PrimaryAction onClick={onContinue}>Continue</PrimaryAction>
      </div>
    </div>
  );
}
