import { BODY_AREAS, DURATIONS } from './script';

export type IntakeField = 'area' | 'duration' | 'intensity';

export type AreaSpan = {
  kind: 'area';
  area: string;
  raw: string;
  start: number;
  end: number;
  alternatives?: string[];
};

export type DurationSpan = {
  kind: 'duration';
  duration: string;
  raw: string;
  start: number;
  end: number;
};

export type IntensitySpan = {
  kind: 'intensity';
  intensity: number;
  raw: string;
  start: number;
  end: number;
};

export type IntakeSpan = AreaSpan | DurationSpan | IntensitySpan;

const AREA_ALIASES: Record<string, string[]> = {
  Neck: ['neck', 'cervical', 'head', 'skull', 'temple'],
  Shoulder: ['shoulders', 'shoulder'],
  Wrist: ['wrists', 'wrist', 'hands', 'hand'],
  Elbow: ['elbows', 'elbow', 'arms', 'arm'],
  Back: [
    'between the shoulder blades',
    'between shoulder blades',
    'upper back',
    'lower back',
    'mid back',
    'low back',
    'lumbar',
    'thoracic',
    'spine',
    'back',
  ],
  Hip: ['hips', 'hip', 'pelvis'],
  Knee: ['knees', 'knee', 'patella'],
  'Ankle / Foot': ['ankles', 'ankle', 'feet', 'foot'],
};

const DURATION_RULES: { duration: (typeof DURATIONS)[number]; pattern: RegExp }[] =
  [
    {
      duration: 'More than 3 months',
      pattern:
        /\b(more than 3 months|over 3 months|years?|chronic|forever|a long time|six months|6 months|[4-9]\s*months|\d{2,}\s*months)\b/i,
    },
    {
      duration: '1 to 3 months',
      pattern:
        /\b(1\s*(to|–|-)\s*3\s*months|a month|one month|two months|three months|[123]\s*months?)\b/i,
    },
    {
      duration: '2–4 weeks',
      pattern:
        /\b(2\s*(to|–|-)\s*4\s*weeks|couple( of)? weeks|few weeks|two weeks|three weeks|four weeks|[234]\s*weeks)\b/i,
    },
    {
      duration: 'Less than 2 weeks',
      pattern:
        /\b(less than (a |2 )?weeks?|few days|couple of days|just started|this week|yesterday|today|a week|one week)\b/i,
    },
  ];

const NUMBER_WORDS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

const INTENSITY_WORDS: { value: number; pattern: RegExp }[] = [
  { value: 10, pattern: /\b(worst|unbearable|excruciating|extreme)\b/i },
  { value: 8, pattern: /\b(pretty bad|severe|awful|terrible|strong)\b/i },
  { value: 5, pattern: /\b(moderate|medium|noticeable)\b/i },
  { value: 3, pattern: /\b(mild|slight|a little)\b/i },
  { value: 1, pattern: /\b(no pain|none)\b/i },
];

const EXPLICIT_INTENSITY =
  /\b(?:(?:a|an|it's|its|about|around|level|like)\s+)(10|[0-9]|zero|one|two|three|four|five|six|seven|eight|nine|ten)\b|\b(10|[0-9]|zero|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:\/|out of)\s*10\b/i;

const LOOSE_INTENSITY =
  /\b(10|[0-9]|zero|one|two|three|four|five|six|seven|eight|nine|ten)(?:\s*(?:\/|out of)\s*10)?\b/i;

type AliasPattern = { area: string; alias: string; regex: RegExp };

const AREA_PATTERNS: AliasPattern[] = Object.entries(AREA_ALIASES)
  .filter(([area]) => (BODY_AREAS as readonly string[]).includes(area))
  .flatMap(([area, aliases]) =>
    aliases.map((alias) => ({
      area,
      alias,
      regex: new RegExp(`\\b${escapeRegExp(alias)}\\b`, 'ig'),
    })),
  )
  .sort((a, b) => b.alias.length - a.alias.length);

const AREA_TOKEN_SET = new Set(
  AREA_PATTERNS.map((item) => item.alias.toLowerCase()),
);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function overlaps(start: number, end: number, spans: { start: number; end: number }[]) {
  return spans.some((span) => start < span.end && span.start < end);
}

function parseNumberToken(token: string) {
  const word = NUMBER_WORDS[token.toLowerCase()];
  if (word != null) return word;
  if (!/^\d+$/.test(token)) return null;
  const value = Number(token);
  if (value < 0 || value > 10) return null;
  return value;
}

function collectAreaSpans(text: string): AreaSpan[] {
  const spans: AreaSpan[] = [];
  const byRange = new Map<string, AreaSpan>();

  for (const pattern of AREA_PATTERNS) {
    pattern.regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.regex.exec(text))) {
      const start = match.index;
      const raw = match[0];
      const end = start + raw.length;
      const key = `${start}:${end}`;
      const existing = byRange.get(key);

      if (existing) {
        if (existing.area !== pattern.area) {
          const alternatives = new Set(existing.alternatives ?? [existing.area]);
          alternatives.add(pattern.area);
          existing.alternatives = [...alternatives];
        }
        continue;
      }

      if (overlaps(start, end, spans)) continue;

      const span: AreaSpan = {
        kind: 'area',
        area: pattern.area,
        raw,
        start,
        end,
      };
      byRange.set(key, span);
      spans.push(span);
    }
  }

  return spans.sort((a, b) => a.start - b.start);
}

function collectDurationSpan(text: string): DurationSpan | null {
  for (const rule of DURATION_RULES) {
    const match = rule.pattern.exec(text);
    if (!match) continue;
    return {
      kind: 'duration',
      duration: rule.duration,
      raw: match[0],
      start: match.index,
      end: match.index + match[0].length,
    };
  }
  return null;
}

function collectIntensitySpan(text: string, explicitOnly: boolean): IntensitySpan | null {
  for (const rule of INTENSITY_WORDS) {
    const match = rule.pattern.exec(text);
    if (!match) continue;
    return {
      kind: 'intensity',
      intensity: rule.value,
      raw: match[0],
      start: match.index,
      end: match.index + match[0].length,
    };
  }

  const pattern = explicitOnly ? EXPLICIT_INTENSITY : LOOSE_INTENSITY;
  const match = pattern.exec(text);
  if (!match) return null;
  const value = parseNumberToken(match[1] ?? match[2] ?? match[0]);
  if (value == null) return null;
  return {
    kind: 'intensity',
    intensity: value,
    raw: match[0],
    start: match.index,
    end: match.index + match[0].length,
  };
}

export function parseAreas(text: string, maxAreas: number = BODY_AREAS.length) {
  const unique: AreaSpan[] = [];
  for (const span of collectAreaSpans(text)) {
    if (unique.some((item) => item.area === span.area)) continue;
    unique.push(span);
    if (unique.length >= maxAreas) break;
  }
  return unique;
}

export function parseDuration(text: string) {
  return collectDurationSpan(text);
}

export function parseIntensity(text: string, explicitOnly = false) {
  return collectIntensitySpan(text, explicitOnly);
}

export function parseField(text: string, field: IntakeField, maxAreas = 3) {
  if (field === 'area') return parseAreas(text, maxAreas);
  if (field === 'duration') {
    const span = parseDuration(text);
    return span ? [span] : [];
  }
  const span = parseIntensity(text, false);
  return span ? [span] : [];
}

export function parseExtras(text: string): {
  duration?: string;
  intensity?: number;
} {
  return {
    duration: parseDuration(text)?.duration,
    intensity: parseIntensity(text, true)?.intensity,
  };
}

export function liveWrapPending(pending: string, field: IntakeField) {
  const token = pending.trim();
  if (!token) return null;
  if (field === 'area') {
    return AREA_TOKEN_SET.has(token.toLowerCase())
      ? (parseAreas(token, 1)[0] ?? null)
      : null;
  }
  if (field === 'duration') return parseDuration(token);
  return parseIntensity(token, false);
}

export function uniqueAreas(spans: AreaSpan[], maxAreas: number) {
  const areas: string[] = [];
  for (const span of spans) {
    if (areas.includes(span.area)) continue;
    areas.push(span.area);
    if (areas.length >= maxAreas) break;
  }
  return areas;
}
