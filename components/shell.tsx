import { Container } from '@/components/container';
import { getCurrentContributor } from '@/playground/identity';
import { getContributorsByTeam, getPrototypes } from '@/playground/prototypes';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarItem,
  SidebarSubItem,
} from '@/components/sidebar';
import { SwordLogo } from '@/design/assets/logos/sword';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/design/components/collapsible';
import { ChevronDown } from 'lucide-react';

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const contributor = getCurrentContributor();
  const contributorsByTeam = getContributorsByTeam();
  const prototypeCount = getPrototypes().length;
  const initials = contributor
    ? contributor.name
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : null;

  return (
    <div className="flex h-full">
      <Sidebar>
        <SidebarHeader>
          <SwordLogo variant="primary" className="w-24" />
        </SidebarHeader>
        <SidebarContent>
          <nav className="flex flex-col gap-2">
            <SidebarItem
              href="/"
              label="Prototypes"
              icon="layers"
              count={prototypeCount}
            />
          </nav>
          {contributorsByTeam.length > 0 ? (
            <div className="mt-4 flex flex-col gap-1">
              <p className="text-body-medium-subtle text-foreground-neutral-subtle px-2 py-1">
                Contributors
              </p>
              {contributorsByTeam.map(({ team, contributors }) => (
                <Collapsible key={team} defaultOpen className="flex flex-col">
                  <SidebarGroup>
                    <SidebarGroupLabel render={<CollapsibleTrigger />}>
                      <span className="text-foreground-neutral-default text-body-large-subtle">
                        {team}
                      </span>
                      <ChevronDown className="text-foreground-neutral-faded size-4 shrink-0 transition-transform group-data-panel-open:rotate-180" />
                    </SidebarGroupLabel>
                    <CollapsibleContent>
                      <SidebarGroupContent className="pb-1">
                        {contributors.map((contributor) => (
                          <SidebarSubItem
                            key={contributor.username}
                            href={`/?author=${contributor.username}`}
                            label={contributor.name}
                          />
                        ))}
                      </SidebarGroupContent>
                    </CollapsibleContent>
                  </SidebarGroup>
                </Collapsible>
              ))}
            </div>
          ) : null}
        </SidebarContent>
        {contributor ? (
          <SidebarFooter>
            <div className="flex items-center gap-3 rounded-md px-2 py-2">
              <span
                className="bg-background-neutral-strong text-body-small-subtle text-foreground-neutral-default flex size-8 shrink-0 items-center justify-center rounded-full"
                aria-hidden
              >
                {initials}
              </span>
              <span className="text-body-large-subtle text-foreground-neutral-default">
                {contributor.name}
              </span>
            </div>
          </SidebarFooter>
        ) : null}
      </Sidebar>
      <Container className="flex flex-col py-10">{children}</Container>
    </div>
  );
}
