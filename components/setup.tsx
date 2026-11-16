'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

interface CopySetupPromptProps {
  prompt: string;
}

export function CopySetupPrompt({ prompt }: CopySetupPromptProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      return;
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-body-large-subtle text-foreground-neutral-faded hover:bg-background-neutral-inverse/4 hover:text-foreground-neutral-default flex items-center gap-3 rounded-md px-2 py-2 text-left transition-colors"
    >
      {copied ? (
        <Check className="size-5 shrink-0" />
      ) : (
        <Copy className="size-5 shrink-0" />
      )}
      <span className="flex-1">{copied ? 'Copied' : 'Copy setup prompt'}</span>
    </button>
  );
}
