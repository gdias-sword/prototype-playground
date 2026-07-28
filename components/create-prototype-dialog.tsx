'use client';

import {
  createPrototype,
  type CreatePrototypeState,
} from '@/app/actions/create-prototype';
import { Button, buttonVariants } from '@/design/components/button';
import { Input } from '@/design/components/input';
import { Textarea } from '@/design/components/textarea';
import { mergeTailwindClasses as cn } from '@/utils/tailwind';
import { Dialog } from '@base-ui/react/dialog';
import { useActionState, useState } from 'react';

const initialFormState: CreatePrototypeState = {};

interface CreatePrototypeDialogProps {
  playgroundUsername: string | null;
}

function CreatePrototypeForm({
  playgroundUsername,
}: CreatePrototypeDialogProps) {
  if (!playgroundUsername) {
    return null;
  }

  const [state, formAction, isPending] = useActionState(
    createPrototype,
    initialFormState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Input
        label="Title"
        id="title"
        name="title"
        type="text"
        required
        autoComplete="off"
        placeholder="Chat input exploration"
      />
      <Textarea
        label={
          <>
            Description <span className="font-normal">(optional)</span>
          </>
        }
        id="description"
        name="description"
        rows={3}
        placeholder="One line about what you are exploring"
      />
      {state.error ? (
        <p
          className="text-body-small-default text-foreground-brand-strong"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          variant="solid"
          size="medium"
          disabled={isPending}
        >
          {isPending ? 'Creating…' : 'Create prototype'}
        </Button>
        <Dialog.Close
          type="button"
          className={cn(buttonVariants({ variant: 'outline', size: 'medium' }))}
        >
          Cancel
        </Dialog.Close>
      </div>
    </form>
  );
}

export function CreatePrototypeDialog(props: CreatePrototypeDialogProps) {
  const [formKey, setFormKey] = useState(0);

  return (
    <Dialog.Root
      onOpenChange={(open) => {
        if (open) {
          setFormKey((key) => key + 1);
        }
      }}
    >
      <Dialog.Trigger
        type="button"
        className={cn(buttonVariants({ variant: 'solid', size: 'medium' }))}
      >
        Create prototype
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            'bg-background-neutral-inverse/40 fixed inset-0 z-50 backdrop-blur-[2px] transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0',
          )}
        />
        <Dialog.Viewport
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center p-4',
          )}
        >
          <Dialog.Popup
            className={cn(
              'border-border-neutral-faded bg-background-neutral-default text-foreground-neutral-default w-full max-w-md rounded-2xl border p-6 shadow-lg transition-transform duration-200 data-ending-style:scale-95 data-starting-style:scale-95',
            )}
          >
            <Dialog.Title className="text-title-small-strong text-foreground-neutral-default">
              New prototype
            </Dialog.Title>
            <div className="mt-6">
              <CreatePrototypeForm
                key={formKey}
                playgroundUsername={props.playgroundUsername}
              />
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
