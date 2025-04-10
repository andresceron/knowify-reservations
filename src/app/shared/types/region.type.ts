import { Region } from '../interfaces/region.interface';

export type RegionType = 'main-hall' | 'bar' | 'riverside' | 'riverside-smoking';

export const REGION_OPTIONS: Region[] = [
  { label: 'Main Hall', value: 'main-hall', capacity: 12, allowChildren: true, allowSmoking: false },
  { label: 'Bar (No children)', value: 'bar', capacity: 4, allowChildren: false, allowSmoking: false },
  { label: 'Riverside', value: 'riverside', capacity: 6, allowChildren: true, allowSmoking: false },
  { label: 'Riverside (Smoking allowed)', value: 'riverside-smoking', capacity: 6, allowChildren: false, allowSmoking: true },
];
