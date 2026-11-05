'use client';

import { useState } from 'react';
import { codes, type CodeId } from './codes';
import { GuiaFigure } from './guia';
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

export function VariantC() {
  const [values, setValues] = useState<Values>(emptyValues);
  const [step, setStep] = useState(0);
  const code = codes[step];

  function back() {
    setStep((current) => Math.max(0, current - 1));
  }

  function next() {
    setStep((current) => Math.min(codes.length - 1, current + 1));
  }

  return (
    <EnrollmentScreen>
      <main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col gap-8 px-6 pt-6 pb-44 md:px-10 md:pt-8">
        <Progress />
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,380px)]">
          <GuiaFigure active={code.id} mode="spot" />
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="text-[14px] leading-5 font-semibold text-[#4a89e8]">
                {step + 1} de {codes.length}
              </p>
              <ScreenTitle>Encontre este código na guia</ScreenTitle>
              <ExampleNote />
            </div>
            <CodeInput
              code={code}
              value={values[code.id]}
              active
              onActivate={() => undefined}
              onValue={(value) =>
                setValues((current) => ({ ...current, [code.id as CodeId]: value }))
              }
            />
            <p id={`${code.id}-cue`} className="text-[14px] leading-5 text-[#2e2e2e]">
              {code.cue}
            </p>
            <ol className="flex flex-col gap-2">
              {codes.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setStep(index)}
                    aria-current={index === step ? 'step' : undefined}
                    className={
                      index === step
                        ? 'w-full cursor-pointer rounded-xl px-3 py-2 text-left text-[14px] leading-5 font-semibold text-[#0d0d0d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]'
                        : 'w-full cursor-pointer rounded-xl px-3 py-2 text-left text-[14px] leading-5 text-[#5e5e5e] hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]'
                    }
                  >
                    {index + 1}. {item.label}
                    {values[item.id] ? ' · preenchido' : ''}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </main>
      <Actions
        onBack={back}
        onContinue={next}
        continueLabel={step === codes.length - 1 ? 'Continuar' : 'Seguinte'}
      />
    </EnrollmentScreen>
  );
}
