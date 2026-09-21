export const gradientThemes = {
  'sword-health': {
    label: 'Sword Health',
    stop1: '#ff7e7e',
    stop2: '#be95e5',
    stop3: '#4a89e8',
  },
  bloom: {
    label: 'Bloom',
    stop1: '#af7bdf',
    stop2: '#cddff8',
    stop3: '#af7bdf',
  },
  mind: {
    label: 'Mind',
    stop1: '#ff6f40',
    stop2: '#fff5d6',
    stop3: '#ff6f40',
  },
  move: {
    label: 'Move',
    stop1: '#fed267',
    stop2: '#ebf7ff',
    stop3: '#fed267',
  },
  pulse: {
    label: 'Pulse',
    stop1: '#26bdac',
    stop2: '#fff5db',
    stop3: '#26bdac',
  },
  thrive: {
    label: 'Thrive',
    stop1: '#5993ea',
    stop2: '#ffe8d6',
    stop3: '#5993ea',
  },
  dawn: {
    label: 'Dawn',
    stop1: '#ff9c31',
    stop2: '#fff1c4',
    stop3: '#ff9c31',
  },
} as const;

export type GradientTheme = keyof typeof gradientThemes;
