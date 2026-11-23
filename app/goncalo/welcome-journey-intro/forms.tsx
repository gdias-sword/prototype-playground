'use client';

import { Input } from '@/design/components/input';
import { Check, ChevronDown, Eye, EyeOff, Info } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Container, ProgressBar, SubHeader } from './shell';

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
        <div className="flex flex-col gap-3">
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

export function Address() {
  const [country, setCountry] = useState('');
  return (
    <Container
      header={
        <>
          <ProgressBar total={5} current={0} />
          <SubHeader
            title="Where should we send your kit?"
            description="Enter the address where you’d like to receive your welcome kit."
          />
        </>
      }
    >
      <div className="grid gap-10 sm:grid-cols-2 sm:gap-x-4">
        <div className="sm:col-span-2">
          <Input
            label="Address line 1"
            placeholder="Street address"
            autoComplete="address-line1"
            className={FIELD}
          />
        </div>
        <Input
          label="Apartment, suite, etc."
          placeholder="Optional"
          autoComplete="address-line2"
          className={FIELD}
        />
        <Input
          label="City"
          placeholder="City"
          autoComplete="address-level2"
          className={FIELD}
        />
        <label className="flex flex-col gap-3">
          <span className="text-body-medium-strong">Country</span>
          <span className="relative">
            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              autoComplete="country"
              className={`${FIELD} w-full cursor-pointer appearance-none border border-[#c2c2c2] bg-white pr-10 outline-none focus:ring-2 focus:ring-[#4a89e8] ${country ? 'text-foreground-neutral-default' : 'text-foreground-neutral-faded'}`}
            >
              <option value="" disabled>
                Choose
              </option>
              <option>United States</option>
              <option>Canada</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2"
              strokeWidth={1.5}
            />
          </span>
        </label>
        <Input
          label="Postal code"
          placeholder="ZIP / postal code"
          autoComplete="postal-code"
          className={FIELD}
        />
      </div>
    </Container>
  );
}
