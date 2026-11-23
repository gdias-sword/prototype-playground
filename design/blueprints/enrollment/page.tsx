'use client';

import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { useState } from 'react';
import {
  Container,
  EASE,
  Footer,
  Header,
  ProgressBar,
  SubHeader,
} from './shell';

const STEPS = 2;

export default function EnrollmentBlueprint() {
  const [step, setStep] = useState(0);
  const [visit, setVisit] = useState(0);

  function goTo(index: number) {
    setStep(Math.max(0, Math.min(STEPS - 1, index)));
    setVisit((value) => value + 1);
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-background-neutral-default relative isolate flex h-dvh flex-col overflow-hidden text-[#0d0d0d]">
        <Header />
        <AnimatePresence mode="wait">
          <motion.main
            key={visit}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto"
            initial={false}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <Container
              header={
                <>
                  <ProgressBar total={STEPS} current={step} />
                  <SubHeader title="Title" description="Description" />
                </>
              }
            >
              <div className="text-body-medium-default flex h-40 items-center justify-center rounded-2xl border border-dashed border-[#c2c2c2] tracking-[0.2px] text-[#8f8f8f]">
                Content
              </div>
            </Container>
            <Footer
              onPrevious={step > 0 ? () => goTo(step - 1) : undefined}
              onContinue={() => goTo(step + 1)}
            />
          </motion.main>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
