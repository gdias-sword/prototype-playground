'use client';

import { cn } from '@/design/utils';
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import guia from './assets/guia.png';
import { codes, type CodeId, type CodeRegion } from './codes';

function imageSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

const guiaSrc = imageSrc(guia);
const source = { width: 2148, height: 1234 };
const dim = 'rgba(13, 13, 13, 0.28)';

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

function frameStyle(frame: CodeRegion) {
  return {
    left: `${frame.left}%`,
    top: `${frame.top}%`,
    width: `${frame.width}%`,
    height: `${frame.height}%`,
  };
}

function Spot({
  frame,
  shade = dim,
  className,
}: {
  frame: CodeRegion;
  shade?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute rounded-md', className)}
      style={{ ...frameStyle(frame), boxShadow: `0 0 0 9999px ${shade}` }}
    />
  );
}

interface Size {
  width: number;
  height: number;
}

interface Camera {
  x: number;
  y: number;
  scale: number;
}

function useElementSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

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

function useAfterPaint(ready: boolean) {
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const frame = window.requestAnimationFrame(() => setCanAnimate(true));
    return () => window.cancelAnimationFrame(frame);
  }, [ready]);

  return canAnimate;
}

function fitSheet(view: Size, mode: 'contain' | 'width'): Camera {
  if (view.width === 0 || view.height === 0) return { x: 0, y: 0, scale: 0 };
  if (mode === 'width') return { scale: view.width / source.width, x: 0, y: 0 };

  const scale = Math.min(
    view.width / source.width,
    view.height / source.height,
  );
  return {
    scale,
    x: (view.width - source.width * scale) / 2,
    y: (view.height - source.height * scale) / 2,
  };
}

function focusRegion(
  view: Size,
  frame: CodeRegion,
  fillX: number,
  fillY: number,
  atLeastContain = false,
): Camera {
  if (view.width === 0 || view.height === 0) return { x: 0, y: 0, scale: 0 };

  const frameX = (frame.left / 100) * source.width;
  const frameY = (frame.top / 100) * source.height;
  const frameWidth = (frame.width / 100) * source.width;
  const frameHeight = (frame.height / 100) * source.height;
  let scale = Math.min(
    (view.width * fillX) / frameWidth,
    (view.height * fillY) / frameHeight,
  );
  if (atLeastContain) {
    scale = Math.max(
      Math.min(view.width / source.width, view.height / source.height),
      scale,
    );
  }

  let x = view.width / 2 - (frameX + frameWidth / 2) * scale;
  let y = view.height / 2 - (frameY + frameHeight / 2) * scale;
  const scaledWidth = source.width * scale;
  const scaledHeight = source.height * scale;

  if (scaledWidth <= view.width) x = (view.width - scaledWidth) / 2;
  else x = Math.min(0, Math.max(view.width - scaledWidth, x));

  if (scaledHeight <= view.height) y = (view.height - scaledHeight) / 2;
  else y = Math.min(0, Math.max(view.height - scaledHeight, y));

  return { x, y, scale };
}

function Sheet({
  camera,
  alt,
  className,
  transition,
  children,
}: {
  camera: Camera;
  alt: string;
  className?: string;
  transition?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn('absolute top-0 left-0', className)}
      style={{
        width: source.width,
        height: source.height,
        transformOrigin: '0 0',
        transform: `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.scale})`,
        transition,
        visibility: camera.scale > 0 ? 'visible' : 'hidden',
      }}
    >
      <img
        src={guiaSrc}
        alt={alt}
        width={source.width}
        height={source.height}
        draggable={false}
        className="block h-full w-full max-w-none select-none"
      />
      {children}
    </div>
  );
}

interface GuiaCropProps {
  id: CodeId;
  className?: string;
}

export function GuiaCrop({ id, className }: GuiaCropProps) {
  const code = codes.find((item) => item.id === id)!;
  const box = padded(code.region, 2.4);
  const bitmap =
    typeof guia === 'string'
      ? { width: 2148, height: 1234 }
      : { width: guia.width, height: guia.height };
  const aspect = (box.width / box.height) * (bitmap.width / bitmap.height);

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

interface GuiaFigureProps {
  active: CodeId | null;
  mode: 'marks' | 'spot';
  onSelect?: (id: CodeId) => void;
}

export function GuiaFigure({ active, mode, onSelect }: GuiaFigureProps) {
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
          <Spot
            frame={spot}
            shade="rgba(13, 13, 13, 0.55)"
            className="ring-2 ring-[#4a89e8]"
          />
        ) : null}
        {mode === 'marks'
          ? codes.map((code) => {
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
                  style={frameStyle(zoomFrames[code.id])}
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

const sheetZoom = {
  delay: 1200,
  duration: 1600,
  hold: 1200,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

interface GuiaSheetZoomProps {
  id: CodeId;
  className?: string;
}

export function GuiaSheetZoom({ id, className }: GuiaSheetZoomProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const viewport = useElementSize(frameRef);
  const [zoomed, setZoomed] = useState(false);
  const measured = viewport.width > 0;
  const canAnimate = useAfterPaint(measured);
  const spot = padded(zoomFrames[id], 0.45);
  const shot = zoomed
    ? focusRegion(viewport, padded(spot, 1.4), 0.94, 0.94)
    : fitSheet(viewport, 'contain');

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
      <Sheet
        camera={shot}
        alt="Exemplo de uma guia de prestação SNS. A vista começa na página inteira, aproxima o código e volta à página inteira."
        className="motion-reduce:transition-none"
        transition={
          canAnimate
            ? `transform ${sheetZoom.duration}ms ${sheetZoom.easing}`
            : undefined
        }
      >
        <Spot frame={spot} />
      </Sheet>
    </div>
  );
}

interface GuiaSheetPreviewProps {
  active: CodeId | null;
}

export function GuiaSheetPreview({ active }: GuiaSheetPreviewProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const viewport = useElementSize(frameRef);
  const frame = active ? zoomFrames[active] : null;
  const shot = frame
    ? focusRegion(viewport, frame, 0.88, 0.5)
    : fitSheet(viewport, 'width');
  const canAnimate = useAfterPaint(shot.scale > 0);

  return (
    <div
      ref={frameRef}
      className="relative h-40 w-full overflow-hidden rounded-xl bg-white"
    >
      <Sheet
        camera={shot}
        alt="Exemplo de uma guia de prestação SNS."
        className={
          canAnimate
            ? 'transition-transform duration-500 ease-out motion-reduce:transition-none'
            : undefined
        }
      >
        {frame ? <Spot frame={frame} /> : null}
      </Sheet>
    </div>
  );
}

interface GuiaZoomProps {
  active: CodeId | null;
  zoomed: boolean;
  onSelect: (id: CodeId) => void;
  fill?: number;
  interactive?: boolean;
  className?: string;
}

export function GuiaZoom({
  active,
  zoomed,
  onSelect,
  fill = 0.55,
  interactive = true,
  className,
}: GuiaZoomProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const viewport = useElementSize(frameRef);
  const frame = zoomed && active ? zoomFrames[active] : null;
  const shot = frame
    ? focusRegion(viewport, frame, fill, fill, true)
    : fitSheet(viewport, 'contain');

  return (
    <figure className={cn('flex h-full min-h-0 flex-col', className)}>
      <div
        ref={frameRef}
        className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white"
      >
        <Sheet
          camera={shot}
          alt="Exemplo de uma guia de prestação SNS. O código do campo selecionado está assinalado."
          className={
            shot.scale > 0
              ? 'transition-[transform] duration-500 ease-out motion-reduce:transition-none'
              : undefined
          }
        >
          {interactive ? (
            codes.map((code) => {
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
                    ...frameStyle(zoomFrames[code.id]),
                    boxShadow: isActive ? `0 0 0 9999px ${dim}` : undefined,
                  }}
                />
              );
            })
          ) : active ? (
            <Spot frame={zoomFrames[active]} />
          ) : null}
        </Sheet>
      </div>
    </figure>
  );
}
