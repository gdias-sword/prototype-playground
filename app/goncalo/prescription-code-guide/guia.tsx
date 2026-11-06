'use client';

import { cn } from '@/design/utils';
import { useEffect, useRef, useState, type RefObject } from 'react';
import guia from './assets/guia.png';
import { codes, type CodeId, type CodeRegion } from './codes';

function imageSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

const guiaSrc = imageSrc(guia);

function padded(region: CodeRegion, amount: number): CodeRegion {
  const left = Math.max(0, region.left - amount);
  const top = Math.max(0, region.top - amount);
  const right = Math.min(100, region.left + region.width + amount);
  const bottom = Math.min(100, region.top + region.height + amount);
  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  };
}

const source = { width: 2148, height: 1234 };

function pixelFrame(
  x: number,
  y: number,
  width: number,
  height: number,
): CodeRegion {
  return {
    left: (x / source.width) * 100,
    top: (y / source.height) * 100,
    width: (width / source.width) * 100,
    height: (height / source.height) * 100,
  };
}

const zoomFrames: Record<CodeId, CodeRegion> = {
  requisicao: pixelFrame(1464, 56, 624, 166),
  acesso: pixelFrame(55, 562, 457, 60),
  prestacao: pixelFrame(664, 562, 492, 60),
};

export function GuiaCrop({
  id,
  className,
}: {
  id: CodeId;
  className?: string;
}) {
  const code = codes.find((item) => item.id === id)!;
  const box = padded(code.region, 2.4);
  const source =
    typeof guia === 'string'
      ? { width: 2148, height: 1234 }
      : { width: guia.width, height: guia.height };
  const aspect = (box.width / box.height) * (source.width / source.height);

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-[#c2c2c2] bg-white',
        className,
      )}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: aspect }}>
        <img
          alt=""
          src={guiaSrc}
          className="absolute max-w-none"
          style={{
            width: `${10000 / box.width}%`,
            height: `${10000 / box.height}%`,
            left: `${(-box.left / box.width) * 100}%`,
            top: `${(-box.top / box.height) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

export function GuiaFigure({
  active,
  mode,
  onSelect,
}: {
  active: CodeId | null;
  mode: 'marks' | 'spot';
  onSelect?: (id: CodeId) => void;
}) {
  const spot = mode === 'spot' && active ? zoomFrames[active] : null;

  return (
    <figure className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white">
        <img
          src={guiaSrc}
          alt="Exemplo de uma guia de prestação SNS, com o número da requisição, o código de acesso e o código de prestação assinalados."
          className="block h-auto w-full"
        />
        {spot ? (
          <div
            aria-hidden
            className="pointer-events-none absolute rounded-md ring-2 ring-[#4a89e8]"
            style={{
              left: `${spot.left}%`,
              top: `${spot.top}%`,
              width: `${spot.width}%`,
              height: `${spot.height}%`,
              boxShadow: '0 0 0 9999px rgba(13, 13, 13, 0.55)',
            }}
          />
        ) : null}
        {mode === 'marks'
          ? codes.map((code) => {
              const frame = zoomFrames[code.id];
              const isActive = code.id === active;
              return (
                <button
                  key={code.id}
                  type="button"
                  aria-label={`${code.label}. ${code.cue}`}
                  aria-pressed={isActive}
                  onClick={() => onSelect?.(code.id)}
                  className={cn(
                    'absolute rounded-md ring-2 transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]',
                    isActive
                      ? 'z-10 shadow-[0_0_0_4px_rgba(74,137,232,0.28)] ring-[#4a89e8]'
                      : 'ring-transparent hover:ring-[#4a89e8]/70',
                  )}
                  style={{
                    left: `${frame.left}%`,
                    top: `${frame.top}%`,
                    width: `${frame.width}%`,
                    height: `${frame.height}%`,
                  }}
                />
              );
            })
          : null}
      </div>
      <figcaption className="text-[13px] leading-5 text-[#5e5e5e]">
        Exemplo de guia. Não use estes números.
      </figcaption>
    </figure>
  );
}

function useElementSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      const rect = element.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      setSize((current) =>
        current.width === width && current.height === height
          ? current
          : { width, height },
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}

function viewTransform(
  viewport: { width: number; height: number },
  frame: CodeRegion | null,
  fill = 0.55,
) {
  const { width: viewWidth, height: viewHeight } = viewport;
  if (viewWidth === 0 || viewHeight === 0) {
    return { x: 0, y: 0, scale: 0 };
  }

  if (!frame) {
    const scale = Math.min(
      viewWidth / source.width,
      viewHeight / source.height,
    );
    return {
      scale,
      x: (viewWidth - source.width * scale) / 2,
      y: (viewHeight - source.height * scale) / 2,
    };
  }

  const frameX = (frame.left / 100) * source.width;
  const frameY = (frame.top / 100) * source.height;
  const frameWidth = (frame.width / 100) * source.width;
  const frameHeight = (frame.height / 100) * source.height;
  const contain = Math.min(
    viewWidth / source.width,
    viewHeight / source.height,
  );
  const scale = Math.max(
    contain,
    Math.min(
      (viewWidth * fill) / frameWidth,
      (viewHeight * fill) / frameHeight,
    ),
  );

  let x = viewWidth / 2 - (frameX + frameWidth / 2) * scale;
  let y = viewHeight / 2 - (frameY + frameHeight / 2) * scale;
  const scaledWidth = source.width * scale;
  const scaledHeight = source.height * scale;

  if (scaledWidth <= viewWidth) x = (viewWidth - scaledWidth) / 2;
  else x = Math.min(0, Math.max(viewWidth - scaledWidth, x));

  if (scaledHeight <= viewHeight) y = (viewHeight - scaledHeight) / 2;
  else y = Math.min(0, Math.max(viewHeight - scaledHeight, y));

  return { x, y, scale };
}

function stageTransform(
  viewport: { width: number; height: number },
  frame: CodeRegion | null,
) {
  const { width: viewWidth, height: viewHeight } = viewport;
  if (viewWidth === 0 || viewHeight === 0) {
    return { x: 0, y: 0, scale: 0 };
  }

  const contain = Math.min(
    viewWidth / source.width,
    viewHeight / source.height,
  );
  if (!frame) {
    return {
      scale: contain,
      x: (viewWidth - source.width * contain) / 2,
      y: (viewHeight - source.height * contain) / 2,
    };
  }

  const frameX = (frame.left / 100) * source.width;
  const frameY = (frame.top / 100) * source.height;
  const frameWidth = (frame.width / 100) * source.width;
  const frameHeight = (frame.height / 100) * source.height;
  const scale = Math.min(
    (viewWidth * 0.94) / frameWidth,
    (viewHeight * 0.94) / frameHeight,
  );

  let x = viewWidth / 2 - (frameX + frameWidth / 2) * scale;
  let y = viewHeight / 2 - (frameY + frameHeight / 2) * scale;
  const scaledWidth = source.width * scale;
  const scaledHeight = source.height * scale;

  if (scaledWidth <= viewWidth) x = (viewWidth - scaledWidth) / 2;
  else x = Math.min(0, Math.max(viewWidth - scaledWidth, x));

  if (scaledHeight <= viewHeight) y = (viewHeight - scaledHeight) / 2;
  else y = Math.min(0, Math.max(viewHeight - scaledHeight, y));

  return { x, y, scale };
}

const sheetZoom = {
  delay: 1200,
  duration: 1600,
  hold: 1200,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

export function GuiaSheetZoom({
  id,
  className,
}: {
  id: CodeId;
  className?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const viewport = useElementSize(frameRef);
  const [zoomed, setZoomed] = useState(false);
  const [canAnimate, setCanAnimate] = useState(false);
  const spot = padded(zoomFrames[id], 0.45);
  const camera = padded(spot, 1.4);
  const measured = viewport.width > 0;
  const { x, y, scale } = stageTransform(viewport, zoomed ? camera : null);

  useEffect(() => {
    if (!measured) return;
    const frame = window.requestAnimationFrame(() => setCanAnimate(true));
    return () => window.cancelAnimationFrame(frame);
  }, [measured]);

  useEffect(() => {
    if (!canAnimate) return;

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduce) return;

    const zoomIn = window.setTimeout(() => setZoomed(true), sheetZoom.delay);
    const zoomOut = window.setTimeout(
      () => setZoomed(false),
      sheetZoom.delay + sheetZoom.duration + sheetZoom.hold,
    );
    return () => {
      window.clearTimeout(zoomIn);
      window.clearTimeout(zoomOut);
    };
  }, [id, canAnimate]);

  return (
    <div
      ref={frameRef}
      className={cn(
        'relative w-full overflow-hidden rounded-lg border border-[#d8d8d8] bg-white',
        className,
      )}
      style={{ aspectRatio: `${source.width} / ${source.height}` }}
    >
      <div
        className="absolute top-0 left-0 motion-reduce:transition-none"
        style={{
          width: source.width,
          height: source.height,
          transformOrigin: '0 0',
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
          transition: canAnimate
            ? `transform ${sheetZoom.duration}ms ${sheetZoom.easing}`
            : undefined,
          visibility: scale > 0 ? 'visible' : 'hidden',
        }}
      >
        <img
          src={guiaSrc}
          alt="Exemplo de uma guia de prestação SNS. A vista começa na página inteira, aproxima o código e volta à página inteira."
          width={source.width}
          height={source.height}
          draggable={false}
          className="block h-full w-full max-w-none select-none"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-md"
          style={{
            left: `${spot.left}%`,
            top: `${spot.top}%`,
            width: `${spot.width}%`,
            height: `${spot.height}%`,
            boxShadow: '0 0 0 9999px rgba(13, 13, 13, 0.28)',
          }}
        />
      </div>
    </div>
  );
}

export function GuiaZoom({
  active,
  zoomed,
  onSelect,
  fill = 0.55,
  interactive = true,
  className,
}: {
  active: CodeId | null;
  zoomed: boolean;
  onSelect: (id: CodeId) => void;
  fill?: number;
  interactive?: boolean;
  className?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const viewport = useElementSize(frameRef);
  const frame = zoomed && active ? zoomFrames[active] : null;
  const { x, y, scale } = viewTransform(viewport, frame, fill);
  const ready = scale > 0;

  return (
    <figure className={cn('flex h-full min-h-0 flex-col', className)}>
      <div
        ref={frameRef}
        className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white"
      >
        <div
          className={cn(
            'absolute top-0 left-0',
            ready &&
              'transition-[transform] duration-500 ease-out motion-reduce:transition-none',
          )}
          style={{
            width: source.width,
            height: source.height,
            transformOrigin: '0 0',
            transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
            visibility: ready ? 'visible' : 'hidden',
          }}
        >
          <img
            src={guiaSrc}
            alt="Exemplo de uma guia de prestação SNS. O código do campo selecionado está assinalado."
            width={source.width}
            height={source.height}
            draggable={false}
            className="block h-full w-full max-w-none select-none"
          />
          {interactive ? (
            codes.map((code) => {
              const spot = zoomFrames[code.id];
              const isActive = code.id === active;
              return (
                <button
                  key={code.id}
                  type="button"
                  data-code={code.id}
                  aria-label={`${code.label}. ${code.cue}`}
                  aria-pressed={isActive}
                  onClick={() => onSelect(code.id)}
                  className="absolute z-10 cursor-pointer rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]"
                  style={{
                    left: `${spot.left}%`,
                    top: `${spot.top}%`,
                    width: `${spot.width}%`,
                    height: `${spot.height}%`,
                    boxShadow: isActive
                      ? '0 0 0 9999px rgba(13, 13, 13, 0.28)'
                      : undefined,
                  }}
                />
              );
            })
          ) : active ? (
            <div
              aria-hidden
              className="pointer-events-none absolute rounded-md"
              style={{
                left: `${zoomFrames[active].left}%`,
                top: `${zoomFrames[active].top}%`,
                width: `${zoomFrames[active].width}%`,
                height: `${zoomFrames[active].height}%`,
                boxShadow: '0 0 0 9999px rgba(13, 13, 13, 0.28)',
              }}
            />
          ) : null}
        </div>
      </div>
    </figure>
  );
}
