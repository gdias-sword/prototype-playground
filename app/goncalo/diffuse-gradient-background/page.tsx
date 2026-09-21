import { SwordLogo } from '@/design/assets/logos/sword';
import { Accessibility, ChevronDown, Globe } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

import { DiffuseGradient } from './diffuse-gradient';

const GRADIENT_TOKENS = {
  '--gradient-primary-stop-1': '#ff7e7e',
  '--gradient-primary-stop-2': '#be95e5',
  '--gradient-primary-stop-3': '#4a89e8',
} as CSSProperties;

const fields = [
  { label: 'First name', placeholder: 'Your first name', type: 'text' },
  { label: 'Last name', placeholder: 'Your last name', type: 'text' },
  { label: 'Email', placeholder: 'youremail@email.com', type: 'email' },
  { label: 'Date of birth', placeholder: 'mm / dd / yyyy', type: 'text' },
] as const;

function Field({
  label,
  placeholder,
  type,
}: {
  label: string;
  placeholder: string;
  type: string;
}) {
  return (
    <label className="flex w-full flex-col gap-4 text-[14px] leading-5 font-semibold tracking-[0.2px] text-[#2e2e2e]">
      {label}
      <input
        type={type}
        placeholder={placeholder}
        className="h-16 w-full rounded-2xl border border-[#c2c2c2] bg-white px-4 text-[14px] leading-5 font-medium tracking-[0.2px] text-[#2e2e2e] transition-[border-color,box-shadow] outline-none placeholder:text-[#5e5e5e] focus:border-[#4a89e8] focus:ring-3 focus:ring-[#4a89e8]/20"
      />
    </label>
  );
}

function Agreement({ children }: { children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-4 text-[14px] leading-5 font-medium tracking-[0.2px] text-[#0d0d0d]">
      <input
        type="checkbox"
        className="mt-0 size-8 shrink-0 appearance-none rounded border border-[#c2c2c2] bg-white checked:border-[#4a89e8] checked:bg-[#4a89e8]"
      />
      <span className="pt-1.5">{children}</span>
    </label>
  );
}

const linkClass =
  'text-[#4a89e8] underline decoration-1 underline-offset-2 transition-colors hover:text-[#316fcf]';

export default function Eligibility() {
  return (
    <div
      className="relative isolate flex min-h-dvh w-full min-w-0 flex-col overflow-hidden bg-white"
      style={GRADIENT_TOKENS}
    >
      <DiffuseGradient />

      <header className="relative z-10 flex h-[84px] w-full shrink-0 items-center justify-between bg-white px-4 py-5 sm:px-8 lg:px-16">
        <SwordLogo className="h-6 w-auto" />

        <div className="flex items-center gap-4 sm:gap-6">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 text-[#0d0d0d]"
          >
            <Globe className="size-5" strokeWidth={1.5} />
            <span className="text-[14px] leading-5 font-semibold tracking-[0.2px]">
              US <span className="font-normal">(EN)</span>
            </span>
            <ChevronDown className="size-3" strokeWidth={1.5} />
          </button>
          <Accessibility className="size-5 text-[#0d0d0d]" strokeWidth={1.5} />
          <button
            type="button"
            className="h-10 cursor-pointer rounded-xl border border-[#0d0d0d] px-6 text-[14px] leading-5 font-semibold tracking-[0.2px] text-[#0d0d0d] transition-colors hover:bg-[#f2f2f2]"
          >
            Log in
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[680px] flex-1 flex-col px-4 pb-8 sm:px-0">
        <section className="flex flex-col gap-4 pt-8 pb-10">
          <h1 className="font-serif text-[28px] leading-9 font-normal tracking-[-0.4px] text-[#0d0d0d]">
            Good news! These benefits are offered by Gonçalo.
          </h1>
          <p className="text-[16px] leading-[22px] text-[#2e2e2e]">
            Create an account to confirm your eligibility.
          </p>
        </section>

        <form className="flex flex-col gap-10">
          {fields.map((field) => (
            <Field key={field.label} {...field} />
          ))}

          <label className="flex w-full flex-col gap-4 text-[14px] leading-5 font-semibold tracking-[0.2px] text-[#2e2e2e]">
            State
            <span className="relative">
              <select
                defaultValue=""
                className="h-16 w-full appearance-none rounded-2xl border border-[#c2c2c2] bg-white px-4 text-[14px] leading-5 font-medium tracking-[0.2px] text-[#5e5e5e] transition-[border-color,box-shadow] outline-none focus:border-[#4a89e8] focus:ring-3 focus:ring-[#4a89e8]/20"
              >
                <option value="" disabled>
                  Choose
                </option>
                <option value="ca">California</option>
                <option value="ny">New York</option>
                <option value="tx">Texas</option>
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-4 size-6 -translate-y-1/2 text-[#0d0d0d]"
                strokeWidth={1.5}
              />
            </span>
          </label>

          <div className="flex flex-col gap-4 pt-1">
            <Agreement>
              I have read and agree to Sword Health&apos;s{' '}
              <a className={linkClass} href="#terms">
                Terms and Conditions
              </a>
              ,{' '}
              <a className={linkClass} href="#telehealth">
                Consent to Telehealth Services
              </a>{' '}
              and{' '}
              <a className={linkClass} href="#privacy">
                Privacy Statement
              </a>
              .
            </Agreement>
            <Agreement>
              I have read and agree to Sword Health&apos;s{' '}
              <a className={linkClass} href="#hipaa">
                HIPAA Notice of Privacy Practices
              </a>
              .
            </Agreement>
          </div>

          <div className="flex justify-center pb-0">
            <button
              type="submit"
              className="h-12 min-w-[180px] cursor-pointer rounded-2xl bg-[#4a89e8] px-8 text-[14px] leading-5 font-semibold tracking-[0.2px] text-white transition-colors hover:bg-[#3d7ad4] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#4a89e8]"
            >
              Continue
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
