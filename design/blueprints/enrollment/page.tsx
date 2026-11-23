'use client';

import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { useState } from 'react';
import { Checkbox, TextField } from './fields';
import { Container, Footer, Header, ProgressBar, SubHeader } from './shell';

const SECTIONS = [3, 2];
const TOTAL_STEPS = SECTIONS.reduce((sum, count) => sum + count, 0);

function locate(index: number) {
  let remaining = index;
  for (let section = 0; section < SECTIONS.length; section++) {
    const stepsInSection = SECTIONS[section];
    if (remaining < stepsInSection) {
      return { section, step: remaining };
    }
    remaining -= stepsInSection;
  }
  const last = SECTIONS.length - 1;
  return { section: last, step: SECTIONS[last] - 1 };
}

const SCREENS = [
  {
    title: 'Tell us a bit about you',
    description:
      'We’ll use this to confirm your eligibility and set up your account.',
    content: (
      <div className="flex flex-col gap-6">
        <TextField label="First name" placeholder="Your first name" />
        <TextField label="Last name" placeholder="Your last name" />
        <TextField
          label="Email"
          type="email"
          placeholder="youremail@email.com"
        />
        <TextField label="Date of birth" placeholder="MM / DD / YYYY" />
        <TextField label="ZIP code" placeholder="00000" />
      </div>
    ),
  },
  {
    title: 'Create your password',
    description: 'Choose a password to finish setting up your account.',
    content: (
      <div className="flex flex-col gap-2">
        <TextField
          label="Password"
          type="password"
          placeholder="Create a password"
        />
        <p className="px-2 text-[12px] leading-4 text-[#595959]">
          Must be 8 characters long
        </p>
      </div>
    ),
  },
  {
    title: 'Almost there',
    description: 'Confirm a few details before we continue.',
    content: (
      <div className="flex flex-col gap-4">
        <Checkbox>
          I agree to the Terms of Use and acknowledge the Privacy Policy and
          Notice of Privacy Practices.
        </Checkbox>
        <Checkbox>I confirm I am 18 years or older.</Checkbox>
      </div>
    ),
  },
  {
    title: 'Where should we send your kit?',
    description:
      'Enter the address where you’d like to receive your welcome kit.',
    content: (
      <div className="flex flex-col gap-6">
        <TextField
          label="Address line 1"
          placeholder="Street address"
          autoComplete="address-line1"
        />
        <TextField
          label="City"
          placeholder="City"
          autoComplete="address-level2"
        />
        <TextField
          label="Postal code"
          placeholder="ZIP / postal code"
          autoComplete="postal-code"
        />
      </div>
    ),
  },
  {
    title: 'How can we reach you?',
    description:
      'Add a phone number so we can keep you updated about your kit.',
    content: (
      <div className="flex flex-col gap-6">
        <TextField
          label="Phone number"
          type="tel"
          placeholder="Phone number"
          autoComplete="tel"
        />
        <Checkbox>
          I agree to receive SMS marketing updates from Sword. I acknowledge
          that message frequency will vary based on my program and that I can
          opt out at any time.
        </Checkbox>
      </div>
    ),
  },
];

export default function EnrollmentBlueprint() {
  const [index, setIndex] = useState(0);
  const [visit, setVisit] = useState(0);
  const { section, step } = locate(index);
  const screen = SCREENS[index];

  function goTo(next: number) {
    setIndex(Math.max(0, Math.min(TOTAL_STEPS - 1, next)));
    setVisit((value) => value + 1);
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-background-neutral-default relative isolate flex h-dvh flex-col overflow-hidden text-[#0d0d0d]">
        <Header />
        <div className="mx-auto w-full max-w-(--breakpoint-md) shrink-0 px-6 pt-6 lg:pt-8">
          <ProgressBar sections={SECTIONS} section={section} step={step} />
        </div>
        <AnimatePresence mode="wait">
          <motion.main
            key={visit}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto"
            initial={false}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0.8, 0.2, 1] as const }}
          >
            <Container
              className="pt-8 lg:pt-10"
              header={
                <SubHeader
                  title={screen.title}
                  description={screen.description}
                />
              }
            >
              {screen.content}
            </Container>
            <Footer
              onPrevious={index > 0 ? () => goTo(index - 1) : undefined}
              onContinue={() => goTo(index + 1)}
            />
          </motion.main>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
