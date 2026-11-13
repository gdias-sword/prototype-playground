'use client';

import { Popover } from '@base-ui/react/popover';
import { History } from 'lucide-react';
import { useState } from 'react';

import type { Version } from '@/playground/versions';

interface VersionHistoryProps {
  path: string;
}

const triggerClass =
  'text-foreground-neutral-faded hover:bg-background-neutral-subtle hover:text-foreground-neutral-default relative flex size-9 cursor-pointer items-center justify-center rounded-xl transition-colors data-[popup-open]:bg-background-brand-default data-[popup-open]:text-foreground-neutral-inverse data-[popup-open]:hover:bg-background-brand-strong data-[popup-open]:hover:text-foreground-neutral-inverse';

export function VersionHistory({ path }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[] | null>(null);
  const [currentSha, setCurrentSha] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  function handleOpenChange(open: boolean) {
    if (!open) return;
    setSearch(window.location.search);
    if (versions) return;
    void load();
  }

  async function load() {
    setError(null);
    try {
      const response = await fetch(
        `/api/versions?path=${encodeURIComponent(path)}`,
        { cache: 'no-store' },
      );
      const payload = (await response.json()) as {
        versions?: Version[];
        currentSha?: string | null;
        error?: string;
      };
      if (!response.ok || !payload.versions) {
        setError(payload.error ?? 'Could not load versions.');
        return;
      }
      setVersions(payload.versions);
      setCurrentSha(payload.currentSha ?? null);
    } catch {
      setError('Could not load versions.');
    }
  }

  const activeSha = currentVersionSha(versions ?? [], currentSha);

  return (
    <Popover.Root onOpenChange={handleOpenChange}>
      <Popover.Trigger
        className={triggerClass}
        aria-label="Versions"
        title="Versions"
      >
        <History className="size-4" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="top" sideOffset={8} className="z-[10003]">
          <Popover.Popup
            data-prototype-chrome
            data-comment-ui
            className="border-border-neutral-subtle bg-background-neutral-default max-h-80 w-52 overflow-y-auto rounded-2xl border p-1 shadow-[0_8px_16px_rgba(0,0,0,0.14)] outline-none"
          >
            {error ? (
              <p className="text-body-small-default text-foreground-neutral-subtle px-2 py-2">
                {error}
              </p>
            ) : versions == null ? (
              <p className="text-body-small-default text-foreground-neutral-subtle px-2 py-2">
                Loading
              </p>
            ) : versions.length === 0 ? (
              <p className="text-body-small-default text-foreground-neutral-subtle px-2 py-2">
                No shared versions yet.
              </p>
            ) : (
              <ul className="flex flex-col">
                {versions.map((version) => {
                  const current = version.sha === activeSha;
                  const label = formatVersionTime(version.createdAt);
                  return (
                    <li key={version.sha}>
                      {current ? (
                        <span
                          aria-current="true"
                          className="text-body-medium-default text-foreground-neutral-default flex items-center gap-2 px-2 py-2"
                        >
                          <span className="bg-background-brand-default size-2 rounded-full" />
                          <time dateTime={version.createdAt}>{label}</time>
                        </span>
                      ) : (
                        <a
                          href={versionHref(version.url, path, search)}
                          title={versionHref(version.url, path, search)}
                          className="text-body-medium-default text-foreground-neutral-subtle hover:bg-background-neutral-subtle hover:text-foreground-neutral-default flex items-center gap-2 rounded-xl px-2 py-2"
                        >
                          <span className="size-2" />
                          <time dateTime={version.createdAt}>{label}</time>
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function currentVersionSha(
  versions: Version[],
  deploymentSha: string | null,
): string | null {
  if (versions.length === 0) return null;
  if (
    deploymentSha &&
    versions.some((version) => version.sha === deploymentSha)
  ) {
    return deploymentSha;
  }
  if (deploymentSha) return versions[0]?.sha ?? null;
  return null;
}

function versionHref(origin: string, pathname: string, search: string): string {
  return new URL(`${pathname}${search}`, origin).href;
}

function formatVersionTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}
