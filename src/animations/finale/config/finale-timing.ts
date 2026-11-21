export interface FinaleActMeta {
  id: number;
  key: string;
  start: number;
  end: number;
  title: string;
}

export const FINALE_DURATION = 270;

export const FINALE_ACTS: FinaleActMeta[] = [
  { id: 1, key: 'act01', start: 0, end: 20, title: 'A última surpresa' },
  { id: 2, key: 'act02', start: 20, end: 45, title: 'A explosão do jardim' },
  { id: 3, key: 'act03', start: 45, end: 70, title: 'O céu vira um espetáculo' },
  { id: 4, key: 'act04', start: 70, end: 90, title: 'Chuva de estrelas' },
  { id: 5, key: 'act05', start: 90, end: 115, title: 'Uma festa no jardim' },
  { id: 6, key: 'act06', start: 115, end: 140, title: 'A primeira grande revelação' },
  { id: 7, key: 'act07', start: 140, end: 165, title: 'Uma homenagem à amizade' },
  { id: 8, key: 'act08', start: 165, end: 185, title: 'A tempestade de pétalas' },
  { id: 9, key: 'act09', start: 185, end: 210, title: 'O maior espetáculo de fogos' },
  { id: 10, key: 'act10', start: 210, end: 235, title: 'O grande FELIZ ANIVERSÁRIO' },
  { id: 11, key: 'act11', start: 235, end: 255, title: 'A mensagem final' },
  { id: 12, key: 'act12', start: 255, end: 270, title: 'A última surpresa' }
];
