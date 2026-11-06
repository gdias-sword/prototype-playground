'use client';

import { useRef, useState, type FocusEvent } from 'react';
import { codes, type CodeId } from './codes';
import { GuiaZoom } from './guia';
import {
  Actions,
  CodeInput,
  emptyValues,
  EnrollmentScreen,
  ExampleNote,
  Progress,
  ScreenTitle,
  type Values,
} from './parts';

export function VariantE() {
  const [values, setValues] = useState<Values>(emptyValues);
  const [active, setActive] = useState<CodeId | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const inputs = useRef<Partial<Record<CodeId, HTMLInputElement | null>>>({});

  function focusField(id: CodeId) {
    setActive(id);
    setZoomed(true);
    inputs.current[id]?.focus();
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    const next = event.relatedTarget;
    if (next instanceof HTMLElement) {
      if (codes.some((code) => next.id === `${code.id}-input`)) return;
      if (next.dataset.code) return;
    }
    setActive(null);
    setZoomed(false);
  }

  return (
    <EnrollmentScreen>
      <main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col gap-8 px-6 pt-6 pb-28 md:px-10 md:pt-8">
        <Progress />
        <div className="flex flex-col gap-4">
          <ScreenTitle>Introduza os dados da sua prescrição</ScreenTitle>
          <ExampleNote />
        </div>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:items-stretch lg:gap-10">
          <div className="order-2 flex flex-col gap-10 lg:order-1">
            {codes.map((code) => (
              <div key={code.id} className="flex flex-col gap-2">
                <CodeInput
                  code={code}
                  value={values[code.id]}
                  active={active === code.id}
                  onActivate={() => {
                    setActive(code.id);
                    setZoomed(true);
                  }}
                  onBlur={handleBlur}
                  onValue={(value) =>
                    setValues((current) => ({ ...current, [code.id]: value }))
                  }
                  inputRef={(node) => {
                    inputs.current[code.id] = node;
                  }}
                />
                <p
                  id={`${code.id}-cue`}
                  className={
                    active === code.id
                      ? 'text-[14px] leading-5 text-[#2e2e2e]'
                      : 'text-[14px] leading-5 text-[#5e5e5e]'
                  }
                >
                  {code.cue}
                </p>
              </div>
            ))}
          </div>
          <div className="relative order-1 h-[300px] lg:order-2 lg:h-full lg:min-h-[320px]">
            <div className="h-full lg:absolute lg:inset-0">
              <GuiaZoom
                active={active}
                zoomed={zoomed}
                onSelect={focusField}
              />
            </div>
          </div>
        </div>
      </main>
      <Actions />
    </EnrollmentScreen>
  );
}
