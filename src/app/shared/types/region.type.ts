import { Region } from '../interfaces/region.interface';

export type RegionType = 'main-hall' | 'bar' | 'riverside' | 'riverside-smoking';

export const REGION_OPTIONS: Region[] = [
  {
    label: 'Main Hall',
    value: 'main-hall',
    capacity: 12,
    tables: 5,
    allowChildren: true,
    allowSmoking: false
  },
  {
    label: 'Bar (No children)',
    value: 'bar',
    capacity: 4,
    tables: 3,
    allowChildren: false,
    allowSmoking: false
  },
  {
    label: 'Riverside',
    value: 'riverside',
    capacity: 8,
    tables: 4,
    allowChildren: true,
    allowSmoking: false
  },
  {
    label: 'Riverside (Smoking allowed)',
    value: 'riverside-smoking',
    capacity: 6,
    tables: 2,
    allowChildren: false,
    allowSmoking: true
  },
];
