import { RegionType } from '../types/region.type';

export interface Region {
  label: string;
  value: RegionType;
  capacity: number;
  allowChildren: boolean;
  allowSmoking: boolean;
  tables: number;
  disabled?: boolean;
}