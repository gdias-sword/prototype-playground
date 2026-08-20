'use client';

import { mergeTailwindClasses as cn } from '@/design/utils';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import {
  applyZoneTap,
  clampAreas,
  toggleArea,
  zoneById,
  type BodyView,
  type MapZoneId,
} from './body-map';
import { GlassChip, GlassIconButton } from './glass';

const BodySkeleton = dynamic(
  () => import('./body-skeleton').then((module) => module.BodySkeleton),
  { ssr: false },
);

const ZOOM_MIN = 0;
const ZOOM_MAX = 4;
const ZOOM_DEFAULT = 2;

export interface BodyCanvasPickerProps {
  maxAreas: number;
  selectedAreas: string[];
  onCommit: (areas: string[]) => void;
}

function ContinueButton({
  enabled,
  onClick,
}: {
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <GlassChip
      className={cn(
        'text-center',
        enabled ? '' : 'cursor-not-allowed opacity-40 active:scale-100',
      )}
      onClick={() => {
        if (!enabled) return;
        onClick();
      }}
    >
      Continue
    </GlassChip>
  );
}

function CanvasControls({
  view,
  zoom,
  onFlip,
  onZoom,
}: {
  view: BodyView;
  zoom: number;
  onFlip: (next: BodyView) => void;
  onZoom: (next: number) => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-1 flex items-end justify-between">
      <div className="pointer-events-auto flex items-center gap-1.5">
        <GlassIconButton
          label="Show front"
          selected={view === 'front'}
          onClick={() => onFlip('front')}
        >
          <ChevronLeft className="size-4" />
        </GlassIconButton>
        <GlassIconButton
          label="Show back"
          selected={view === 'back'}
          onClick={() => onFlip('back')}
        >
          <ChevronRight className="size-4" />
        </GlassIconButton>
      </div>
      <div className="pointer-events-auto flex items-center gap-1.5">
        <GlassIconButton
          label="Zoom out"
          disabled={zoom <= ZOOM_MIN}
          onClick={() => onZoom(Math.max(ZOOM_MIN, zoom - 1))}
        >
          <Minus className="size-4" />
        </GlassIconButton>
        <GlassIconButton
          label="Zoom in"
          disabled={zoom >= ZOOM_MAX}
          onClick={() => onZoom(Math.min(ZOOM_MAX, zoom + 1))}
        >
          <Plus className="size-4" />
        </GlassIconButton>
      </div>
    </div>
  );
}

export function BodyCanvasPicker({
  maxAreas,
  selectedAreas,
  onCommit,
}: BodyCanvasPickerProps) {
  const [localSelected, setLocalSelected] = useState(selectedAreas);
  const [view, setView] = useState<BodyView>('front');
  const [zoom, setZoom] = useState(ZOOM_DEFAULT);
  const [drill, setDrill] = useState<MapZoneId | null>(null);

  useEffect(() => {
    setLocalSelected(selectedAreas);
  }, [selectedAreas]);

  const drillZone = drill ? zoneById(drill) : null;

  function handleZoneTap(zone: MapZoneId) {
    const result = applyZoneTap(localSelected, zoneById(zone), maxAreas);
    setLocalSelected(result.selected);
    setDrill(result.drill);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pb-2">
      {localSelected.length > 0 ? (
        <div className="mb-2 flex min-h-9 flex-wrap items-center gap-1.5">
          {localSelected.map((area) => (
            <GlassChip
              key={area}
              selected
              className="w-auto shrink-0 px-3.5 py-2 text-body-small-subtle"
              onClick={() =>
                setLocalSelected(toggleArea(localSelected, area, maxAreas))
              }
            >
              {area}
            </GlassChip>
          ))}
        </div>
      ) : null}

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <BodySkeleton
          view={view}
          zoom={zoom}
          selectedAreas={localSelected}
          drill={drill}
          onZoneTap={handleZoneTap}
        />
        <CanvasControls
          view={view}
          zoom={zoom}
          onFlip={setView}
          onZoom={setZoom}
        />
      </div>

      {drillZone ? (
        <div className="mt-2 flex flex-col gap-2">
          <p className="text-body-small-subtle text-foreground-neutral-faded px-1">
            {drillZone.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {drillZone.leaves.map((area) => (
              <GlassChip
                key={area}
                selected={localSelected.includes(area)}
                className="w-auto shrink-0 px-4 py-2 text-body-small-subtle"
                onClick={() =>
                  setLocalSelected(toggleArea(localSelected, area, maxAreas))
                }
              >
                {area}
              </GlassChip>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-3 shrink-0">
        <ContinueButton
          enabled={localSelected.length > 0}
          onClick={() => onCommit(clampAreas(localSelected, maxAreas))}
        />
      </div>
    </div>
  );
}
