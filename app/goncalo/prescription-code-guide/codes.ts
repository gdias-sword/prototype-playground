export type CodeId = 'requisicao' | 'acesso' | 'prestacao';

export interface CodeRegion {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PrescriptionCode {
  id: CodeId;
  label: string;
  placeholder: string;
  cue: string;
  sheet: string;
  region: CodeRegion;
}

export const codes: PrescriptionCode[] = [
  {
    id: 'requisicao',
    label: 'Número da requisição',
    placeholder: 'ex.: 2001000000333728805',
    cue: 'Canto superior direito, por baixo do código de barras.',
    sheet: 'Canto superior direito, por baixo do código de barras.',
    region: { left: 61.5, top: 1.2, width: 36.5, height: 14.5 },
  },
  {
    id: 'acesso',
    label: 'Código de acesso',
    placeholder: 'ex.: 314321',
    cue: 'Na linha de informação, abaixo do número SNS.',
    sheet: 'Na linha de informação, abaixo do número SNS.',
    region: { left: 1.6, top: 44.6, width: 31, height: 4.8 },
  },
  {
    id: 'prestacao',
    label: 'Código de prestação',
    placeholder: 'ex.: 637585',
    cue: 'Na linha de informação, à direita do Código de Acesso.',
    sheet: 'Na linha de informação, à direita do Código de Acesso.',
    region: { left: 33.2, top: 44.6, width: 22.5, height: 4.8 },
  },
];

export function codeById(id: CodeId) {
  const code = codes.find((item) => item.id === id);
  if (!code) throw new Error(`Unknown code ${id}`);
  return code;
}
