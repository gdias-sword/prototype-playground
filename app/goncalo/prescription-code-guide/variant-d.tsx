'use client';

import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import { useState } from 'react';
import { codes, type CodeId } from './codes';
import { GuiaFigure } from './guia';
import {
  Actions,
  CodeInput,
  emptyValues,
  EnrollmentScreen,
  Progress,
  ScreenTitle,
  type Values,
} from './parts';

export function VariantD() {
  const [values, setValues] = useState<Values>(emptyValues);
  const [active, setActive] = useState<CodeId | null>(null);
  const [pinned, setPinned] = useState<CodeId>('requisicao');

  return (
    <EnrollmentScreen>
      <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col gap-10 px-6 pt-6 pb-44 md:px-0 md:pt-8">
        <Progress />
        <div className="flex flex-col gap-4">
          <ScreenTitle>Introduza os dados da sua prescrição</ScreenTitle>
          <Dialog.Root>
            <Dialog.Trigger className="w-fit cursor-pointer text-[14px] leading-5 font-semibold text-[#4a89e8] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]">
              Ver um exemplo da guia
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 z-50 bg-[#0d0d0d]/40 backdrop-blur-[2px]" />
              <Dialog.Viewport className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
                <Dialog.Popup className="flex max-h-[min(880px,calc(100dvh-6rem))] w-full max-w-3xl flex-col gap-5 overflow-y-auto rounded-3xl bg-white p-5 shadow-lg sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <Dialog.Title className="font-serif text-[26px] leading-8 font-normal text-[#0d0d0d]">
                        Onde estão os códigos
                      </Dialog.Title>
                      <Dialog.Description className="text-[14px] leading-5 text-[#5e5e5e]">
                        Exemplo de uma guia SNS. Procure as mesmas etiquetas na
                        sua — não copie estes números.
                      </Dialog.Description>
                    </div>
                    <Dialog.Close
                      aria-label="Fechar"
                      className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-[#f2f2f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]"
                    >
                      <X className="size-5" aria-hidden />
                    </Dialog.Close>
                  </div>
                  <GuiaFigure active={pinned} mode="marks" onSelect={setPinned} />
                  <ul className="flex flex-col gap-3">
                    {codes.map((code) => (
                      <li key={code.id}>
                        <button
                          type="button"
                          onClick={() => setPinned(code.id)}
                          className={
                            pinned === code.id
                              ? 'w-full cursor-pointer rounded-2xl border border-[#4a89e8] px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]'
                              : 'w-full cursor-pointer rounded-2xl border border-[#e8e8e8] px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]'
                          }
                        >
                          <span className="block text-[14px] leading-5 font-semibold text-[#0d0d0d]">
                            {code.label}
                          </span>
                          <span className="mt-1 block text-[14px] leading-5 text-[#5e5e5e]">
                            {code.cue}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </Dialog.Popup>
              </Dialog.Viewport>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
        <div className="flex flex-col gap-10">
          {codes.map((code) => (
            <CodeInput
              key={code.id}
              code={code}
              value={values[code.id]}
              active={active === code.id}
              onActivate={() => setActive(code.id)}
              onValue={(value) =>
                setValues((current) => ({ ...current, [code.id]: value }))
              }
            />
          ))}
        </div>
      </main>
      <Actions />
    </EnrollmentScreen>
  );
}
