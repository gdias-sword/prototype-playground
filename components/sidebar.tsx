'use client';

import { cn } from '@/design/utils';
import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { Layers, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';

interface SidebarProps {
  children: ReactNode;
  className?: string;
}

function Sidebar({ children, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 hidden w-60 flex-col lg:flex',
        className,
      )}
    >
      {children}
    </aside>
  );
}

interface SidebarInsetProps {
  children: ReactNode;
}

function SidebarInset({ children }: SidebarInsetProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={cn(
        'bg-background-neutral-default lg:border-border-neutral-subtle relative z-10 flex h-dvh flex-col overflow-y-auto transition-transform duration-400 ease-[cubic-bezier(0.4,0.8,0,1)] lg:my-2 lg:h-[calc(100dvh-1rem)] lg:rounded-l-2xl lg:border lg:border-r-0',
        isOpen ? 'lg:translate-x-60' : 'lg:translate-x-2',
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen((isOpen) => !isOpen)}
        className="text-foreground-neutral-faded hover:bg-background-neutral-subtle hover:text-foreground-neutral-default sticky top-2 left-2 z-10 hidden size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors lg:flex"
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        aria-expanded={isOpen}
      >
        <PanelLeft className="size-4" />
      </button>
      <div
        className={cn(
          'flex grow flex-col transition-transform duration-400 ease-[cubic-bezier(0.4,0.8,0,1)]',
          isOpen ? 'lg:-translate-x-30' : 'lg:-translate-x-1',
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface SidebarHeaderProps {
  children: ReactNode;
  className?: string;
}

function SidebarHeader({ children, className }: SidebarHeaderProps) {
  return (
    <div className={cn('flex items-center gap-2 p-5', className)}>
      {children}
    </div>
  );
}

interface SidebarContentProps {
  children: ReactNode;
  className?: string;
}

function SidebarContent({ children, className }: SidebarContentProps) {
  return (
    <div className={cn('flex flex-1 flex-col gap-1 p-3', className)}>
      {children}
    </div>
  );
}

interface SidebarFooterProps {
  children: ReactNode;
  className?: string;
}

function SidebarFooter({ children, className }: SidebarFooterProps) {
  return (
    <div className={cn('flex flex-col gap-1 p-3', className)}>{children}</div>
  );
}

interface SidebarItemProps {
  href: string;
  label: string;
  icon: 'layers';
  count?: number;
}

const icons = {
  layers: Layers,
};

function SidebarItem({ href, label, icon, count }: SidebarItemProps) {
  const Icon = icons[icon];
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      className={cn(
        'text-body-large-subtle flex items-center gap-3 rounded-md px-2 py-2 transition-colors',
        isActive
          ? 'bg-background-neutral-inverse/6 text-foreground-neutral-default'
          : 'text-foreground-neutral-faded hover:bg-background-neutral-inverse/4 hover:text-foreground-neutral-default',
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="size-5 shrink-0" />
      <span className="flex-1">{label}</span>
      {count !== undefined ? (
        <span className="text-body-small-subtle text-foreground-neutral-subtle p-1">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

interface SidebarSubItemProps {
  href: string;
  label: string;
}

function SidebarSubItem({ href, label }: SidebarSubItemProps) {
  return (
    <Link
      href={href}
      className="text-body-large-subtle text-foreground-neutral-faded hover:bg-background-neutral-inverse/4 hover:text-foreground-neutral-default flex items-center rounded-md px-2 py-1.5 pl-8 transition-colors"
    >
      {label}
    </Link>
  );
}

interface SidebarGroupProps {
  children: ReactNode;
  className?: string;
}

function SidebarGroup({ children, className }: SidebarGroupProps) {
  return (
    <div className={cn('relative flex w-full flex-col', className)}>
      {children}
    </div>
  );
}

interface SidebarGroupLabelProps extends useRender.ComponentProps<'div'> {}

function SidebarGroupLabel({
  className,
  render,
  ...props
}: SidebarGroupLabelProps) {
  const defaultProps: useRender.ElementProps<'div'> = {
    className: cn(
      'group text-body-medium-strong text-foreground-neutral-faded data-panel-open:text-foreground-neutral-default flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-2 transition-colors',
      className,
    ),
  };

  return useRender({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(defaultProps, props),
  });
}

interface SidebarGroupContentProps {
  children: ReactNode;
  className?: string;
}

function SidebarGroupContent({
  children,
  className,
}: SidebarGroupContentProps) {
  return <div className={cn('flex flex-col gap-1', className)}>{children}</div>;
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarItem,
  SidebarSubItem,
};
