'use client';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/design/components/drawer';
import { useEffect, useRef, useState, type FocusEvent } from 'react';
import { codes, type CodeId } from './codes';
import { GuiaSheetPreview, GuiaZoom } from './guia';
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
  const [sheetOpen, setSheetOpen] = useState(false);
  const inputs = useRef<Partial<Record<CodeId, HTMLInputElement | null>>>({});

  useEffect(() => {
    const width =
      getComputedStyle(document.documentElement)
        .getPropertyValue('--breakpoint-lg')
        .trim() || '960px';
    const desktop = window.matchMedia(`(min-width: ${width})`);
    const closeSheet = () => {
      if (desktop.matches) setSheetOpen(false);
    };
    closeSheet();
    desktop.addEventListener('change', closeSheet);
    return () => desktop.removeEventListener('change', closeSheet);
  }, []);

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
      <main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col gap-8 px-6 pt-6 pb-28 lg:px-10 lg:pt-8">
        <Progress />
        <div className="flex flex-col gap-4">
          <ScreenTitle>Introduza os dados da sua prescrição</ScreenTitle>
          <Drawer
            open={sheetOpen}
            onOpenChange={(open) => {
              setSheetOpen(open);
              if (open) setSheetCode(null);
            }}
          >
            <p className="text-[16px] leading-[22px] text-[#0d0d0d] lg:text-[14px] lg:leading-5 lg:text-[#5e5e5e]">
              <span className="lg:hidden">
                Pode consultar onde se encontram os códigos{' '}
                <DrawerTrigger className="cursor-pointer font-semibold text-[#4a89e8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]">
                  no exemplo de guia
                </DrawerTrigger>.
              </span>
              <span className="hidden lg:inline">
                Pode consultar os códigos no exemplo de guia. Os números são
                ilustrativos.
              </span>
            </p>
            <DrawerContent className="[--drawer-content-max-height:min(760px,calc(100dvh-4.5rem))]">
              <DrawerHeader className="px-4">
                <DrawerTitle className="font-serif text-[22px] leading-7 font-normal">
                  Encontre os códigos da sua prescrição
                </DrawerTitle>
                <DrawerDescription className="sr-only">
                  Escolha um código para ver onde aparece no exemplo de guia.
                  Os números são ilustrativos.
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pt-6">
                <GuiaSheetPreview active={sheetCode} />
                <div
                  role="radiogroup"
                  aria-label="Códigos da prescrição"
                  className="flex flex-col gap-4"
                >
                  {codes.map((item) => {
                    const selected = sheetCode === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setSheetCode(item.id)}
                        className={
                          selected
                            ? 'rounded-2xl border border-[#4a89e8] bg-[#e0ecfd] p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]'
                            : 'rounded-2xl border border-[#c2c2c2] bg-white p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]'
                        }
                      >
                        <span className="block text-[16px] leading-[22px] font-medium text-[#0d0d0d]">
                          {item.label}
                        </span>
                        <span className="mt-1 block text-[12px] leading-[18px] text-[#0d0d0d]">
                          {item.sheet}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <DrawerFooter className="px-4">
                <DrawerClose className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl bg-[#4a89e8] px-8 text-[14px] leading-5 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]">
                  Compreendi
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:items-stretch lg:gap-10">
          <div className="order-2 flex flex-col gap-10 lg:order-1">
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
                      ? 'hidden text-[14px] leading-5 text-[#2e2e2e] lg:block'
                      : 'hidden text-[14px] leading-5 text-[#5e5e5e] lg:block'
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
