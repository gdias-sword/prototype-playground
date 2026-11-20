'use client';

import { cn } from '@/design/utils';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { useState } from 'react';
import {
  ConditionFocus,
  ConditionQuestion,
  ConditionSelection,
} from './conditions';
import { AccountSetup, Address, Eligibility } from './forms';
import { JourneyIntro } from './journey-intro';
import { Footer, Header } from './shell';

const SCREENS = [
  'Eligibility',
  'Account',
  'Welcome',
  'Address',
  'Conditions',
  'Focus',
  'Question',
] as const;

export function EnrollmentFlow() {
  const [screen, setScreen] = useState(0);
  const [visit, setVisit] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [condition, setCondition] = useState('Neck');
  const name = firstName.trim() || 'Gonçalo';

  function goTo(index: number) {
    setScreen(Math.max(0, Math.min(SCREENS.length - 1, index)));
    setVisit((value) => value + 1);
  }

  const previous = screen > 0 ? () => goTo(screen - 1) : undefined;
  const next = () => goTo(screen + 1);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative isolate flex h-dvh flex-col overflow-hidden bg-white text-[#0d0d0d]">
        <Header />
        <AnimatePresence mode="wait">
          <motion.main
            key={visit}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto"
            initial={false}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 1, 0.4, 1] }}
          >
            {SCREENS[screen] === 'Welcome' ? (
              <JourneyIntro firstName={name} onContinue={next} />
            ) : (
              <>
                {SCREENS[screen] === 'Eligibility' && (
                  <Eligibility
                    firstName={firstName}
                    onFirstNameChange={setFirstName}
                  />
                )}
                {SCREENS[screen] === 'Account' && <AccountSetup />}
                {SCREENS[screen] === 'Address' && <Address />}
                {SCREENS[screen] === 'Conditions' && (
                  <ConditionSelection
                    condition={condition}
                    onConditionChange={setCondition}
                  />
                )}
                {SCREENS[screen] === 'Focus' && (
                  <ConditionFocus condition={condition} firstName={name} />
                )}
                {SCREENS[screen] === 'Question' && (
                  <ConditionQuestion condition={condition} />
                )}
                <Footer
                  label={
                    SCREENS[screen] === 'Address' ? 'Send my kit' : undefined
                  }
                  isSolid={SCREENS[screen] !== 'Focus'}
                  onPrevious={previous}
                  onContinue={next}
                />
              </>
            )}
          </motion.main>
        </AnimatePresence>
        <nav
          aria-label="Prototype screens"
          className="fixed top-3 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/80 p-1 shadow-[0_8px_30px_rgba(31,34,44,0.08)] backdrop-blur-md max-lg:top-auto max-lg:bottom-28"
        >
          {SCREENS.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => goTo(index)}
              aria-current={screen === index ? 'step' : undefined}
              className={cn(
                'cursor-pointer rounded-full px-3 py-1.5 text-[13px] leading-5 transition-colors max-lg:px-2 max-lg:text-[11px]',
                screen === index
                  ? 'bg-[#1f222c] font-semibold text-white'
                  : 'text-[#1f222c] hover:bg-[#f2f2f2]',
              )}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </MotionConfig>
  );
}
