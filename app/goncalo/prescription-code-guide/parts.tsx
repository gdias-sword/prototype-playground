'use client';

import { SwordLogo } from '@/design/assets/logos/sword';
import { cn } from '@/design/utils';
import {
  Accessibility,
  ArrowLeft,
  ChevronDown,
  Globe,
  Menu,
} from 'lucide-react';
import type { FocusEvent, KeyboardEvent, ReactNode } from 'react';
import type { CodeId, PrescriptionCode } from './codes';

export function EnrollmentScreen({
  children,
  topInset = 0,
}: {
  children: ReactNode;
  topInset?: number;
}) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col bg-white text-[#0d0d0d]">
      {topInset > 0 ? (
        <div aria-hidden className="lg:hidden" style={{ height: topInset }} />
      ) : null}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(42% 36% at 8% 100%, rgba(255, 186, 198, 0.55), transparent 70%), radial-gradient(46% 40% at 92% 88%, rgba(168, 196, 255, 0.62), transparent 68%), radial-gradient(28% 24% at 62% 100%, rgba(214, 196, 255, 0.35), transparent 70%)',
        }}
      />
      <header className="flex items-center justify-between bg-white px-6 py-3 lg:px-16 lg:py-5">
        <SwordLogo className="h-6 w-auto" />
        <div className="hidden items-center gap-6 lg:flex">
          <span className="inline-flex items-center gap-2 text-[14px] leading-5 text-black">
            <Globe className="size-6" strokeWidth={1.5} aria-hidden />
            <span className="font-semibold">
              PT <span className="font-normal">(PT)</span>
            </span>
            <ChevronDown className="size-4" strokeWidth={1.5} aria-hidden />
          </span>
          <Accessibility className="size-6" strokeWidth={1.5} aria-hidden />
          <span className="inline-flex items-center gap-2 text-[14px] leading-5 font-semibold text-[#1f222c]">
            Nome Membro
            <ChevronDown className="size-5" strokeWidth={1.5} aria-hidden />
          </span>
        </div>
        <button
          type="button"
          aria-label="Menu"
          className="grid size-10 place-items-center lg:hidden"
        >
          <Menu className="size-6" strokeWidth={1.75} aria-hidden />
        </button>
      </header>
      {children}
    </div>
  );
}

export function Progress() {
  return (
    <div className="flex gap-1" aria-hidden>
      <div className="h-1 flex-1 rounded-full bg-[#4a89e8]" />
      <div className="h-1 flex-1 rounded-full bg-[#c2c2c2]" />
      <div className="h-1 flex-1 rounded-full bg-[#c2c2c2]" />
    </div>
  );
}

export function ScreenTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-serif text-[26px] leading-8 font-normal text-[#0d0d0d]">
      {children}
    </h1>
  );
}

export function CodeInput({
  code,
  value,
  active,
  onValue,
  onActivate,
  onBlur,
  onKeyDown,
  enterKeyHint,
  inputRef,
  labelAction,
  describedByCue = true,
}: {
  code: PrescriptionCode;
  value: string;
  active: boolean;
  onValue: (value: string) => void;
  onActivate: () => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  enterKeyHint?: 'next' | 'done';
  inputRef?: (node: HTMLInputElement | null) => void;
  labelAction?: ReactNode;
  describedByCue?: boolean;
}) {
  const inputId = `${code.id}-input`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1">
        <label
          htmlFor={inputId}
          className="text-[14px] leading-5 font-semibold text-[#2e2e2e]"
        >
          {code.label}
        </label>
        {labelAction}
      </div>
      <input
        id={inputId}
        ref={inputRef}
        value={value}
        inputMode="numeric"
        autoComplete="off"
        enterKeyHint={enterKeyHint}
        placeholder={code.placeholder}
        aria-describedby={describedByCue ? `${code.id}-cue` : undefined}
        onFocus={onActivate}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onChange={(event) => onValue(event.target.value)}
        className={cn(
          'h-16 w-full rounded-2xl border bg-white px-4 text-[16px] leading-5 font-medium text-[#0d0d0d] placeholder:text-[#5e5e5e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414] lg:text-[14px]',
          active ? 'border-[#4a89e8]' : 'border-[#c2c2c2]',
        )}
      />
    </div>
  );
}

export function Actions({
  onBack,
  onContinue,
  continueLabel = 'Continuar',
  className,
}: {
  onBack?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 flex justify-center px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]',
        className,
      )}
    >
      <div className="flex w-full max-w-[400px] items-center gap-4 lg:w-auto">
        <button
          type="button"
          onClick={onBack}
          className="hidden h-12 min-w-[180px] cursor-pointer items-center justify-center rounded-2xl bg-[#e8e8e8] px-8 text-[14px] leading-5 font-semibold text-[#0d0d0d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414] lg:inline-flex"
        >
          Anterior
        </button>
        <button
          type="button"
          aria-label="Anterior"
          onClick={onBack}
          className="grid size-12 shrink-0 cursor-pointer place-items-center rounded-full bg-[#e8e8e8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414] lg:hidden"
        >
          <ArrowLeft className="size-5" strokeWidth={1.75} aria-hidden />
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex h-12 min-w-[180px] flex-1 cursor-pointer items-center justify-center rounded-2xl bg-[#4a89e8] px-8 text-[14px] leading-5 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414] lg:flex-none"
        >
          {continueLabel}
        </button>
      </div>
    </div>
  );
}

export function ExampleNote() {
  return (
    <p className="text-[14px] leading-5 text-[#5e5e5e]">
      Exemplo de uma guia SNS. Os números impressos são ilustrativos — use os da
      sua guia.
    </p>
  );
}

export type Values = Record<CodeId, string>;

export const emptyValues: Values = {
  requisicao: '',
  acesso: '',
  prestacao: '',
};
