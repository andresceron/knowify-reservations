import { Injectable, computed, signal } from '@angular/core';
import { ReservationData } from '../interfaces/reservation.interface';
import { format, isDate } from 'date-fns';

@Injectable({ providedIn: 'root' })
export class ReservationStateService {
  private readonly _reservation = signal<ReservationData | null>(null);
  readonly reservation = computed(() => this._reservation());

  setReservation(data: Partial<ReservationData>) {
    const formattedData: ReservationData = {
      ...data,
      date: isDate(data.date) ? format(data.date, 'yyyy-MM-dd') : (data.date || ''),
    } as ReservationData;

    this._reservation.set(formattedData);
  }

  reset() {
    this._reservation.set(null);
  }

  readonly isValid = computed(() => {
    const r = this._reservation();
    if (!r) {
      return false
    }

    return (
      !!r.date &&
      !!r.time &&
      !!r.name &&
      !!r.email &&
      !!r.phone &&
      r.adults > 0 && r.adults <= 12 &&
      r.children >= 0 && r.children <= 12 &&
      (!r.isBirthday || (r.isBirthday && r.birthdayName !== ''))
    );
  });
}
