'use client';

import { Popover } from '@base-ui/react/popover';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Settings2,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  JUMP_DESTINATIONS,
  jumpDestinationForShortcut,
  type JumpDestinationId,
} from './checkpoint-jumps';
import { DeviceFrame } from './device-frame';
import {
  Experience,
  type ExperienceControls,
  type ExperienceHandle,
} from './experience';
import './commitment-motion.css';
import './motion.css';
import './reward-motion.css';

const EMPTY_CONTROLS: ExperienceControls = {
  canPrev: false,
  canNext: false,
};

export default function PhoenixConversationalOnboarding() {
  const navigatorRef = useRef<ExperienceHandle | null>(null);
  const [replayKey, setReplayKey] = useState(0);
  const [fastDemo, setFastDemo] = useState(false);
  const [controls, setControls] = useState(EMPTY_CONTROLS);

  function handleReplay() {
    setReplayKey((value) => value + 1);
    setControls(EMPTY_CONTROLS);
  }

  function handlePrev() {
    navigatorRef.current?.prevQuestion();
  }

  function handleNext() {
    navigatorRef.current?.nextQuestion();
  }

  function handleJump(destinationId: JumpDestinationId) {
    navigatorRef.current?.jumpTo(destinationId);
  }

  function toggleFastDemo() {
    setFastDemo((value) => !value);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return;
      }

      if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        handleReplay();
        return;
      }

      if (event.key.toLowerCase() === 'f') {
        event.preventDefault();
        toggleFastDemo();
        return;
      }

      if (event.key === '[') {
        event.preventDefault();
        handlePrev();
        return;
      }

      if (event.key === ']') {
        event.preventDefault();
        handleNext();
        return;
      }

      const destination = jumpDestinationForShortcut(event.key);
      if (destination) {
        event.preventDefault();
        handleJump(destination.id);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative flex min-h-dvh w-full min-w-0 flex-1 items-center justify-center overflow-auto p-6">
      <div className="phoenix-device-stage">
        <DeviceFrame>
          <Experience
            key={replayKey}
            fastDemo={fastDemo}
            navigatorRef={navigatorRef}
            onControlsChange={setControls}
          />
        </DeviceFrame>
      </div>

      <Popover.Root>
        <Popover.Trigger
          aria-label="Prototype controls"
          className="bg-background-neutral-inverse/90 text-foreground-neutral-inverse hover:bg-background-neutral-inverse group fixed right-6 bottom-6 z-50 flex size-11 cursor-pointer items-center justify-center rounded-2xl border border-white/12 shadow-[0_8px_28px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-colors duration-200"
        >
          <Settings2 className="size-4 transition-transform duration-200 group-data-popup-open:rotate-90" />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner side="top" align="end" sideOffset={8}>
            <Popover.Popup className="bg-background-neutral-inverse/90 text-foreground-neutral-inverse z-50 w-60 overflow-hidden rounded-2xl border border-white/12 shadow-[0_12px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl transition-[opacity,translate] duration-200 ease-out data-ending-style:translate-y-1 data-ending-style:opacity-0 data-starting-style:translate-y-1 data-starting-style:opacity-0">
              <Popover.Close
                onClick={handleReplay}
                className="text-body-small-subtle flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-white/10"
              >
                <RotateCcw className="size-3.5" />
                Replay
                <kbd className="text-body-small-subtle ml-auto text-white/40">
                  R
                </kbd>
              </Popover.Close>
              <button
                type="button"
                aria-pressed={fastDemo}
                onClick={toggleFastDemo}
                className="text-body-small-subtle flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-white/10 aria-pressed:bg-white/10"
              >
                <Zap className="size-3.5" />
                Fast Mode
                <kbd className="text-body-small-subtle ml-auto text-white/40">
                  F
                </kbd>
              </button>
              <div className="border-t border-white/10 px-3.5 py-2">
                <p className="text-body-small-subtle text-white/50">Jump to</p>
              </div>
              {JUMP_DESTINATIONS.map((destination) => (
                <button
                  key={destination.id}
                  type="button"
                  onClick={() => handleJump(destination.id)}
                  className="text-body-small-subtle flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-left hover:bg-white/10"
                >
                  {destination.label}
                  {destination.shortcut ? (
                    <kbd className="text-body-small-subtle ml-auto text-white/40">
                      {destination.shortcut}
                    </kbd>
                  ) : null}
                </button>
              ))}
              <div className="border-t border-white/10" />
              <button
                type="button"
                disabled={!controls.canPrev}
                onClick={handlePrev}
                className="text-body-small-subtle flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="size-3.5" />
                Previous
                <kbd className="text-body-small-subtle ml-auto text-white/40">
                  [
                </kbd>
              </button>
              <button
                type="button"
                disabled={!controls.canNext}
                onClick={handleNext}
                className="text-body-small-subtle flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronRight className="size-3.5" />
                Next
                <kbd className="text-body-small-subtle ml-auto text-white/40">
                  ]
                </kbd>
              </button>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
