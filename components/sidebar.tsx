'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cn } from '@/design/utils';
import { Layers } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface SidebarProps {
  children: ReactNode;
  className?: string;
}

function Sidebar({ children, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'border-border-neutral-default bg-background-neutral-faded sticky top-0 z-10 hidden h-dvh w-60 shrink-0 flex-col border-r lg:flex',
        className,
      )}
    >
      {children}
    </aside>
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
  SidebarItem,
  SidebarSubItem,
};
