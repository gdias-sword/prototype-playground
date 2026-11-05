'use client';

import { Dialog } from '@base-ui/react/dialog';
import { Info } from 'lucide-react';
import { useState } from 'react';
import { codeById, codes, type CodeId } from './codes';
import { GuiaSheetZoom } from './guia';
import {
  Actions,
  CodeInput,
  emptyValues,
  EnrollmentScreen,
  Progress,
  ScreenTitle,
  type Values,
} from './parts';

export function VariantG() {
  const [values, setValues] = useState<Values>(emptyValues);
  const [active, setActive] = useState<CodeId | null>(null);
  const [sheet, setSheet] = useState<CodeId>('requisicao');
  const [openCount, setOpenCount] = useState(0);
  const code = codeById(sheet);

  return (
    <Dialog.Root
      onOpenChange={(open) => {
        if (open) setOpenCount((count) => count + 1);
      }}
    >
      <EnrollmentScreen>
        <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col gap-10 px-6 pt-6 pb-44 md:px-0 md:pt-8">
          <Progress />
          <ScreenTitle>Introduza os dados da sua prescrição</ScreenTitle>
          <div className="flex flex-col gap-10">
            {codes.map((item) => (
              <div key={item.id} className="flex flex-col">
                <CodeInput
                  code={item}
                  value={values[item.id]}
                  active={active === item.id}
                  onActivate={() => setActive(item.id)}
                  onValue={(value) =>
                    setValues((current) => ({ ...current, [item.id]: value }))
                  }
                  labelAction={
                    <Dialog.Trigger
                      type="button"
                      aria-label={`Como encontrar ${item.label}`}
                      onClick={() => setSheet(item.id)}
                      className="grid size-5 cursor-pointer place-items-center rounded-full text-[#5e5e5e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]"
                    >
                      <Info className="size-4" strokeWidth={2} aria-hidden />
                    </Dialog.Trigger>
                  }
                />
                <p id={`${item.id}-cue`} className="sr-only">
                  {item.cue}
                </p>
              </div>
            ))}
          </div>
        </main>
        <Actions />
      </EnrollmentScreen>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
          <Dialog.Popup className="flex max-h-[min(640px,100dvh)] w-full flex-col gap-8 overflow-y-auto rounded-t-3xl bg-white px-6 py-8 transition duration-200 ease-out data-ending-style:translate-y-full data-starting-style:translate-y-full md:max-h-[min(640px,calc(100dvh-3rem))] md:w-[512px] md:max-w-[720px] md:rounded-2xl md:pt-12 md:pb-8 md:data-ending-style:translate-y-0 md:data-ending-style:scale-95 md:data-ending-style:opacity-0 md:data-starting-style:translate-y-0 md:data-starting-style:scale-95 md:data-starting-style:opacity-0">
            <div className="flex flex-col gap-4 text-[#0d0d0d] md:text-center">
              <Dialog.Title className="font-serif text-[24px] leading-[30px] font-normal">
                {code.label}
              </Dialog.Title>
              <Dialog.Description className="text-[16px] leading-[22px]">
                {code.sheet}
              </Dialog.Description>
            </div>
            <GuiaSheetZoom key={`${code.id}-${openCount}`} id={code.id} />
            <Dialog.Close className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl bg-[#4a89e8] px-8 text-[14px] leading-5 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]">
              Fechar
            </Dialog.Close>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
