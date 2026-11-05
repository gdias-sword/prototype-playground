'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { codes, type CodeId } from './codes';
import { GuiaCrop } from './guia';
import {
  Actions,
  CodeInput,
  emptyValues,
  EnrollmentScreen,
  Progress,
  ScreenTitle,
  type Values,
} from './parts';

export function VariantB() {
  const [values, setValues] = useState<Values>(emptyValues);
  const [open, setOpen] = useState<CodeId | null>(null);
  const [active, setActive] = useState<CodeId | null>(null);

  return (
    <EnrollmentScreen>
      <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col gap-10 px-6 pt-6 pb-44 md:px-0 md:pt-8">
        <Progress />
        <ScreenTitle>Introduza os dados da sua prescrição</ScreenTitle>
        <div className="flex flex-col gap-10">
          {codes.map((code) => {
            const isOpen = open === code.id;
            return (
              <div key={code.id} className="flex flex-col gap-3">
                <CodeInput
                  code={code}
                  value={values[code.id]}
                  active={active === code.id || isOpen}
                  onActivate={() => setActive(code.id)}
                  onValue={(value) =>
                    setValues((current) => ({ ...current, [code.id]: value }))
                  }
                />
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : code.id)}
                  className="inline-flex w-fit cursor-pointer items-center gap-1 text-[14px] leading-5 font-semibold text-[#4a89e8] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]"
                >
                  Como encontrar
                  <ChevronDown
                    className={`size-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    strokeWidth={2}
                    aria-hidden
                  />
                </button>
                {isOpen ? (
                  <div className="flex flex-col gap-3">
                    <GuiaCrop id={code.id} />
                    <p id={`${code.id}-cue`} className="text-[14px] leading-5 text-[#2e2e2e]">
                      {code.cue} O número do exemplo não é o seu.
                    </p>
                  </div>
                ) : (
                  <p id={`${code.id}-cue`} className="sr-only">
                    {code.cue}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <Actions />
    </EnrollmentScreen>
  );
}
