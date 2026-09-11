import fs from 'node:fs';
import path from 'node:path';

import { teams, type Team } from '@/playground/teams';

export type Prototype = {
  username: string;
  author: {
    name: string;
    team: Team;
  };
  slug: string;
  title: string;
  description?: string;
  created: string;
};

export type Contributor = {
  username: string;
  name: string;
  team: Team;
};

export function getContributors(): Contributor[] {
  const app = path.join(process.cwd(), 'app');
  const contributors: Contributor[] = [];

  for (const username of fs.readdirSync(app)) {
    const user = path.join(app, username);
    if (!fs.statSync(user).isDirectory()) continue;

    const profilePath = path.join(user, 'profile.json');
    if (!fs.existsSync(profilePath)) continue;

    const profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8')) as {
      name?: string;
      team?: string;
    };
    if (
      !profile.name ||
      !(teams as readonly string[]).includes(profile.team ?? '')
    ) {
      continue;
    }

    contributors.push({
      username,
      name: profile.name,
      team: profile.team as Team,
    });
  }

  return contributors;
}

export function getPrototypes(): Prototype[] {
  const app = path.join(process.cwd(), 'app');
  const prototypes: Prototype[] = [];

  for (const contributor of getContributors()) {
    const user = path.join(app, contributor.username);
    const author = { name: contributor.name, team: contributor.team };

    for (const slug of fs.readdirSync(user)) {
      const metaPath = path.join(user, slug, 'meta.json');
      if (!fs.existsSync(metaPath)) continue;

      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      prototypes.push({
        username: contributor.username,
        author,
        slug,
        ...meta,
      });
    }
  }

  return prototypes.sort((a, b) => b.created.localeCompare(a.created));
}

export function getContributorsByTeam(): {
  team: Team;
  contributors: Contributor[];
}[] {
  const contributors = getContributors();

  return teams
    .map((team) => ({
      team,
      contributors: contributors
        .filter((contributor) => contributor.team === team)
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter((group) => group.contributors.length > 0);
}
