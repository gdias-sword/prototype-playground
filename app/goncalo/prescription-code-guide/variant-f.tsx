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

export function VariantF() {
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
      <main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col gap-8 px-6 pt-6 pb-48 md:px-10 md:pt-8">
        <Progress />
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:grid-rows-[auto_auto] lg:items-stretch lg:gap-x-10 lg:gap-y-8">
          <div className="order-1 flex flex-col gap-4 lg:col-start-1 lg:row-start-1">
            <ScreenTitle>Introduza os dados da sua prescrição</ScreenTitle>
            <ExampleNote />
          </div>
          <div className="relative order-2 h-[300px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-auto">
            <div className="h-full lg:absolute lg:inset-0">
              <GuiaZoom
                active={active}
                zoomed={zoomed}
                onZoomedChange={setZoomed}
                onSelect={focusField}
              />
            </div>
          </div>
          <div className="order-3 flex flex-col gap-10 lg:col-start-1 lg:row-start-2">
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
        </div>
      </main>
      <Actions />
    </EnrollmentScreen>
  );
}
