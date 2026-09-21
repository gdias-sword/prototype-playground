'use client';

import { SwordLogo } from '@/design/assets/logos/sword';
import { Accessibility, ChevronDown, Globe } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { DiffuseGradient } from './diffuse-gradient';
import { gradientThemes, type GradientTheme } from './gradient-themes';

function accentForeground(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;

  return luminance > 0.62 ? '#0d0d0d' : '#ffffff';
}

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
        className="h-16 w-full rounded-2xl border border-[#c2c2c2] bg-white px-4 text-[14px] leading-5 font-medium tracking-[0.2px] text-[#2e2e2e] transition-[border-color,box-shadow] outline-none placeholder:text-[#5e5e5e] focus:border-[var(--accent)] focus:ring-3 focus:ring-[var(--accent)]/20"
      />
    </label>
  );
}

function Agreement({ children }: { children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-4 text-[14px] leading-5 font-medium tracking-[0.2px] text-[#0d0d0d]">
      <input
        type="checkbox"
        className="mt-0 size-8 shrink-0 appearance-none rounded border border-[#c2c2c2] bg-white checked:border-[var(--accent)] checked:bg-[var(--accent)]"
      />
      <span className="pt-1.5">{children}</span>
    </label>
  );
}

const linkClass =
  'text-[var(--accent)] underline decoration-1 underline-offset-2 transition-colors hover:text-[var(--accent-hover)]';

export default function Eligibility() {
  const [theme, setTheme] = useState<GradientTheme>('sword-health');
  const stops = gradientThemes[theme];

  return (
    <div
      className="relative isolate flex min-h-dvh w-full min-w-0 flex-col overflow-hidden bg-white"
      style={{
        ['--accent' as string]: stops.stop3,
        ['--accent-hover' as string]: `color-mix(in srgb, ${stops.stop3} 78%, black)`,
      }}
    >
      <DiffuseGradient theme={theme} onThemeChange={setTheme} />

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
                className="h-16 w-full appearance-none rounded-2xl border border-[#c2c2c2] bg-white px-4 text-[14px] leading-5 font-medium tracking-[0.2px] text-[#5e5e5e] transition-[border-color,box-shadow] outline-none focus:border-[var(--accent)] focus:ring-3 focus:ring-[var(--accent)]/20"
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
              className="h-12 min-w-[180px] cursor-pointer rounded-2xl bg-[var(--accent)] px-8 text-[14px] leading-5 font-semibold tracking-[0.2px] transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              style={{ color: accentForeground(stops.stop3) }}
            >
              Continue
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
