import { RegionType } from '../types/region.type';
import { TimeSlot } from '../types/time-slot.type';

export interface ReservationData {
  date: string;
  time: TimeSlot;
  name: string;
  email: string;
  phone: string;
  size: number;
  region: RegionType;
  children: number;
  isSmoking: boolean;
  isBirthday: boolean;
  birthdayName?: string;
}
