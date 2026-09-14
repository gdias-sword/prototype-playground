export const STATUSES = ['all', 'active', 'invited', 'closed'] as const;
export const PROGRAMS = ['Thrive', 'Bloom', 'Pulse', 'Mind'] as const;
export const PAGE_SIZES = [10, 25, 50] as const;

export type StatusFilter = (typeof STATUSES)[number];
export type Program = (typeof PROGRAMS)[number];
export type ProgramFilter = 'all' | Program;
export type PatientStatus = Exclude<StatusFilter, 'all'>;

export type Patient = {
  id: string;
  name: string;
  status: PatientStatus;
  program: Program;
  startDate: string | null;
  timeToCare: string | null;
  sessions: number | null;
  pgic: number | null;
  missionReady: number | null;
  missionDelta: number | null;
  therapyArea: string | null;
  closedOn: string | null;
  invitedOn: string | null;
};

export type PatientQuery = {
  search: string;
  status: StatusFilter;
  program: ProgramFilter;
  page: number;
  pageSize: number;
};

export type PatientResult = {
  rows: Patient[];
  total: number;
  page: number;
  from: number;
  to: number;
};

const AREAS = [
  'Lower back',
  'Knee',
  'Pelvic',
  'Shoulder',
  'Neck',
  'Hip',
  'Elbow',
  'Wrist/Hand',
  'Ankle',
  'Upper back',
] as const;

const FIRST_NAMES = [
  'Alex',
  'Jordan',
  'Sam',
  'Taylor',
  'Casey',
  'Riley',
  'Morgan',
  'Avery',
  'Quinn',
  'Cameron',
  'Jamie',
  'Drew',
  'Reese',
  'Parker',
  'Skyler',
  'Hayden',
  'Rowan',
  'Elliot',
  'Finley',
  'Blake',
  'Harper',
  'Logan',
  'Noah',
  'Mia',
  'Sofia',
  'Liam',
  'Owen',
  'Chloe',
  'Grace',
  'Henry',
];

const LAST_NAMES = [
  'Nguyen',
  'Patel',
  'Garcia',
  'Kim',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Miller',
  'Davis',
  'Wilson',
  'Moore',
  'Taylor',
  'Anderson',
  'Thomas',
  'Jackson',
  'White',
  'Harris',
  'Martin',
  'Thompson',
  'Martinez',
  'Robinson',
  'Clark',
  'Rodriguez',
  'Lewis',
  'Lee',
  'Walker',
  'Hall',
  'Allen',
  'Young',
];

const DATES = [
  'Jan 8, 2026',
  'Jan 22, 2026',
  'Feb 3, 2026',
  'Feb 18, 2026',
  'Mar 3, 2026',
  'Mar 19, 2026',
  'Apr 2, 2026',
  'Apr 16, 2026',
  'May 7, 2026',
  'May 21, 2026',
  'Jun 4, 2026',
  'Jun 18, 2026',
  'Jul 9, 2026',
  'Jul 13, 2026',
  'Aug 6, 2026',
  'Aug 20, 2026',
  'Sep 3, 2026',
  'Sep 17, 2026',
  'Oct 1, 2025',
  'Nov 21, 2025',
];

const FIGMA_PATIENTS: Patient[] = [
  {
    id: 'marcus-turner',
    name: 'Marcus Turner',
    status: 'active',
    program: 'Thrive',
    startDate: 'Jul 13, 2026',
    timeToCare: '3 days',
    sessions: 8,
    pgic: 5,
    missionReady: 81,
    missionDelta: 6,
    therapyArea: 'Lower back',
    closedOn: null,
    invitedOn: null,
  },
  {
    id: 'david-crow',
    name: 'David Crow',
    status: 'active',
    program: 'Pulse',
    startDate: 'Mar 3, 2026',
    timeToCare: '1 day',
    sessions: 4,
    pgic: 1,
    missionReady: 34,
    missionDelta: 8,
    therapyArea: 'Knee',
    closedOn: null,
    invitedOn: null,
  },
  {
    id: 'elena-wright',
    name: 'Elena Wright',
    status: 'active',
    program: 'Bloom',
    startDate: 'Mar 3, 2026',
    timeToCare: '14 days',
    sessions: 1,
    pgic: null,
    missionReady: 56,
    missionDelta: null,
    therapyArea: 'Pelvic',
    closedOn: null,
    invitedOn: null,
  },
  {
    id: 'jennifer-asmar',
    name: 'Jennifer Asmar',
    status: 'closed',
    program: 'Mind',
    startDate: 'Nov 21, 2025',
    timeToCare: '2 days',
    sessions: 15,
    pgic: 8,
    missionReady: 95,
    missionDelta: null,
    therapyArea: 'Shoulder',
    closedOn: 'May 7, 2026',
    invitedOn: null,
  },
  {
    id: 'renee-price',
    name: 'Renee Price',
    status: 'invited',
    program: 'Thrive',
    startDate: null,
    timeToCare: null,
    sessions: null,
    pgic: null,
    missionReady: null,
    missionDelta: null,
    therapyArea: null,
    closedOn: null,
    invitedOn: 'Jul 9, 2026',
  },
];

function generatedPatients(): Patient[] {
  const rows: Patient[] = [];

  for (let i = 0; i < 88; i += 1) {
    const name = `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length]}`;
    const program = PROGRAMS[i % PROGRAMS.length];
    const invited = i % 9 === 0;
    const closed = !invited && i % 6 === 0;

    if (invited) {
      rows.push({
        id: `generated-${i}`,
        name,
        status: 'invited',
        program,
        startDate: null,
        timeToCare: null,
        sessions: null,
        pgic: null,
        missionReady: null,
        missionDelta: null,
        therapyArea: null,
        closedOn: null,
        invitedOn: DATES[i % DATES.length],
      });
      continue;
    }

    const pgic = i % 5 === 0 ? null : (i % 9) + 1;
    const missionReady = 28 + ((i * 11) % 70);
    const missionDelta = i % 3 === 0 ? (i % 7) + 2 : null;

    rows.push({
      id: `generated-${i}`,
      name,
      status: closed ? 'closed' : 'active',
      program,
      startDate: DATES[(i + 4) % DATES.length],
      timeToCare: `${(i % 14) + 1} day${i % 14 === 0 ? '' : 's'}`,
      sessions: (i % 16) + 1,
      pgic,
      missionReady,
      missionDelta,
      therapyArea: AREAS[i % AREAS.length],
      closedOn: closed ? DATES[(i + 8) % DATES.length] : null,
      invitedOn: null,
    });
  }

  return rows;
}

export const PATIENTS: Patient[] = [...FIGMA_PATIENTS, ...generatedPatients()];

export function queryPatients(input: PatientQuery): PatientResult {
  const needle = input.search.trim().toLowerCase();
  const filtered = PATIENTS.filter((patient) => {
    if (needle && !patient.name.toLowerCase().includes(needle)) {
      return false;
    }
    if (input.status !== 'all' && patient.status !== input.status) {
      return false;
    }
    if (input.program !== 'all' && patient.program !== input.program) {
      return false;
    }
    return true;
  });

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / input.pageSize) || 1);
  const page = Math.min(Math.max(1, input.page), pageCount);
  const start = (page - 1) * input.pageSize;
  const rows = filtered.slice(start, start + input.pageSize);

  return {
    rows,
    total,
    page,
    from: total === 0 ? 0 : start + 1,
    to: start + rows.length,
  };
}

export function paginationItems(
  current: number,
  total: number,
): Array<number | 'ellipsis'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 'ellipsis', total];
  }

  if (current >= total - 3) {
    return [1, 'ellipsis', total - 3, total - 2, total - 1, total];
  }

  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total];
}
