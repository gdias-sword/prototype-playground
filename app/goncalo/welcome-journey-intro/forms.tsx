'use client';

import { Input } from '@/design/components/input';
import { Check, Eye, EyeOff, Info } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Container, SubHeader } from './shell';

const FIELD = 'h-[52px] rounded-2xl border-[#c2c2c2] px-3 text-[14px]';

function Checkbox({ children }: { children: ReactNode }) {
  const [isChecked, setIsChecked] = useState(false);
  return (
    <label className="flex cursor-pointer items-start gap-4 text-[14px] leading-5 tracking-[0.2px]">
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${isChecked ? 'border-[#4a89e8] bg-[#4a89e8]' : 'border-[#c2c2c2] bg-white'}`}
      >
        {isChecked && <Check className="size-4 text-white" strokeWidth={2.5} />}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={isChecked}
        onChange={(event) => setIsChecked(event.target.checked)}
      />
      <span className="pt-1.5">{children}</span>
    </label>
  );
}

export function Eligibility({
  firstName,
  onFirstNameChange,
}: {
  firstName: string;
  onFirstNameChange: (value: string) => void;
}) {
  return (
    <Container
      header={
        <SubHeader
          title="Good news! These benefits are offered by PepsiCo."
          description="Create an account to confirm your eligibility."
        />
      }
    >
      <div className="flex flex-col gap-10">
        <Input
          label="First name"
          placeholder="Your first name"
          value={firstName}
          onChange={(event) => onFirstNameChange(event.target.value)}
          className={FIELD}
        />
        <Input
          label="Last name"
          placeholder="Your last name"
          className={FIELD}
        />
        <Input
          label="Email"
          type="email"
          placeholder="youremail@email.com"
          className={FIELD}
        />
        <Input
          label="Date of birth"
          placeholder="MM / DD / YYYY"
          className={FIELD}
        />
        <Input label="ZIP code" placeholder="00000" className={FIELD} />
      </div>
      <div className="flex flex-col gap-4">
        <Checkbox>
          I agree to the Terms of Use and acknowledge the Privacy Policy and
          Notice of Privacy Practices.
        </Checkbox>
        <Checkbox>I confirm I am 18 years or older.</Checkbox>
      </div>
    </Container>
  );
}

export function AccountSetup() {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <Container
      header={
        <SubHeader
          title="Finish your account setup"
          description="Please create your password below. Your account will be associated with your email: gdias@email.com"
        />
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="relative">
            <Input
              label="Password"
              type={isVisible ? 'text' : 'password'}
              className={`${FIELD} pr-12`}
            />
            <button
              type="button"
              aria-label={isVisible ? 'Hide password' : 'Show password'}
              onClick={() => setIsVisible((value) => !value)}
              className="absolute right-4 bottom-4 cursor-pointer"
            >
              {isVisible ? (
                <EyeOff className="size-5" strokeWidth={1.5} />
              ) : (
                <Eye className="size-5" strokeWidth={1.5} />
              )}
            </button>
          </div>
          <p className="px-2 text-[12px] leading-4 text-[#595959]">
            Must be 8 characters long
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-body-medium-strong">Phone number</span>
          <div className="flex h-[52px] items-center gap-6 rounded-2xl border border-[#c2c2c2] bg-white px-4 text-[16px] focus-within:ring-2 focus-within:ring-[#4a89e8]">
            <span className="flex items-center gap-2 text-[14px]">
              <span aria-hidden>🇺🇸</span>+1
            </span>
            <input
              type="tel"
              placeholder="Phone number"
              className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#0d0d0d]"
            />
          </div>
        </div>
      </div>
      <p className="flex items-center gap-2 text-[14px] leading-5 tracking-[0.2px]">
        Why do we need your phone number?
        <Info className="size-5" strokeWidth={1.5} />
      </p>
      <Checkbox>
        I agree to receive SMS marketing updates from Sword. I acknowledge that
        message frequency will vary based on my program and that I can opt out
        at any time.
      </Checkbox>
    </Container>
  );
}
