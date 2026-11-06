'use client';

import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import { useRef, useState, type FocusEvent } from 'react';
import { codes, type CodeId } from './codes';
import { GuiaZoom } from './guia';
import {
  Actions,
  CodeInput,
  emptyValues,
  EnrollmentScreen,
  Progress,
  ScreenTitle,
  type Values,
} from './parts';

export function VariantE() {
  const [values, setValues] = useState<Values>(emptyValues);
  const [active, setActive] = useState<CodeId | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [sheetCode, setSheetCode] = useState<CodeId | null>(null);
  const inputs = useRef<Partial<Record<CodeId, HTMLInputElement | null>>>({});
  const activeCode = useRef(active);
  activeCode.current = active;

  function focusField(id: CodeId) {
    setActive(id);
    setZoomed(true);
    inputs.current[id]?.focus();
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    const next = event.relatedTarget;
    if (next instanceof HTMLElement) {
      if (codes.some((item) => next.id === `${item.id}-input`)) return;
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
          <Dialog.Root>
            <div className="text-[14px] leading-5 text-[#5e5e5e]">
              Pode consultar os códigos{' '}
              <Dialog.Trigger
                className="cursor-pointer font-semibold text-[#4a89e8] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414] lg:hidden"
                onPointerDown={() => setSheetCode(activeCode.current)}
              >
                no exemplo de guia
              </Dialog.Trigger>
              <span className="hidden lg:inline">no exemplo de guia</span>. Os
              números são ilustrativos.
            </div>
            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 z-50 bg-[#0d0d0d]/40 backdrop-blur-[2px]" />
              <Dialog.Viewport className="fixed inset-0 z-50 flex items-end justify-center p-3">
                <Dialog.Popup className="flex max-h-[min(720px,calc(100dvh-1.5rem))] w-full flex-col gap-5 overflow-y-auto rounded-3xl bg-white p-5 shadow-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <Dialog.Title className="font-serif text-[26px] leading-8 font-normal text-[#0d0d0d]">
                        Exemplo de guia
                      </Dialog.Title>
                      <Dialog.Description className="text-[14px] leading-5 text-[#5e5e5e]">
                        Os números são ilustrativos.
                      </Dialog.Description>
                    </div>
                    <Dialog.Close
                      aria-label="Fechar"
                      className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-[#f2f2f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]"
                    >
                      <X className="size-5" aria-hidden />
                    </Dialog.Close>
                  </div>
                  <div className="relative h-64 w-full">
                    <div className="absolute inset-0">
                      <GuiaZoom
                        active={sheetCode}
                        zoomed={sheetCode !== null}
                        onSelect={setSheetCode}
                      />
                    </div>
                  </div>
                </Dialog.Popup>
              </Dialog.Viewport>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:items-stretch lg:gap-10">
          <div className="order-2 flex flex-col gap-6 lg:order-1 lg:gap-10">
            {codes.map((item) => (
              <div key={item.id} className="flex flex-col gap-2">
                <CodeInput
                  code={item}
                  value={values[item.id]}
                  active={active === item.id}
                  onActivate={() => {
                    setActive(item.id);
                    setZoomed(true);
                  }}
                  onBlur={handleBlur}
                  onValue={(value) =>
                    setValues((next) => ({ ...next, [item.id]: value }))
                  }
                  inputRef={(node) => {
                    inputs.current[item.id] = node;
                  }}
                />
                <p
                  id={`${item.id}-cue`}
                  className={
                    active === item.id
                      ? 'text-[14px] leading-5 text-[#2e2e2e]'
                      : 'text-[14px] leading-5 text-[#5e5e5e]'
                  }
                >
                  {item.cue}
                </p>
              </div>
            ))}
          </div>
          <div className="relative order-1 hidden h-[300px] lg:order-2 lg:block lg:h-full lg:min-h-[320px]">
            <div className="h-full lg:absolute lg:inset-0">
              <GuiaZoom active={active} zoomed={zoomed} onSelect={focusField} />
            </div>
          </div>
        </div>
      </main>
      <Actions />
    </EnrollmentScreen>
  );
}
