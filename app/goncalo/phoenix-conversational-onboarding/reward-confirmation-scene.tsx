'use client';

import { PhoenixOrb } from './phoenix-orb';
import { PrimaryAction } from './extended-scenes';
import { kitOnTheWayHint, kitOnTheWayLine } from './script';

export function RewardConfirmationScene({
  onContinue,
}: {
  onContinue: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-4">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8">
        <div className="size-20">
          <PhoenixOrb mood="listen" className="h-full w-full" />
        </div>
        <div className="flex max-w-[343px] flex-col gap-4 text-center">
          <h1 className="font-sans text-title-large-subtle text-foreground-neutral-default">
            {kitOnTheWayLine()}
          </h1>
          <p className="text-body-large-default text-foreground-neutral-default">
            {kitOnTheWayHint()}
          </p>
        </div>
      </div>
      <div className="mt-auto w-full pt-4 pb-2">
        <PrimaryAction onClick={onContinue}>Continue</PrimaryAction>
      </div>
    </div>
  );
}
