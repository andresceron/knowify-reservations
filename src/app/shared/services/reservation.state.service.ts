import { Injectable, computed, signal } from '@angular/core';
import { ReservationData } from '../interfaces/reservation.interface';
import { format, isDate } from 'date-fns';
import { REGION_OPTIONS } from '../types/region.type';
import { Region } from '../interfaces/region.interface';
import { MAX_TOTAL_GUESTS } from '../constants/global.constants';

@Injectable({ providedIn: 'root' })
export class ReservationStateService {
  private readonly _reservation = signal<ReservationData | null>(null);
  readonly reservation = computed(() => this._reservation());

  public setReservation(data: Partial<ReservationData>) {
    const formattedData: ReservationData = {
      ...data,
      date: isDate(data.date) ? format(data.date, 'yyyy-MM-dd') : (data.date || ''),
    } as ReservationData;

    this._reservation.set(formattedData);
  }

  public reset() {
    this._reservation.set(null);
  }

  public getAvailableRegions(hasChildren: boolean, isSmoking: boolean): Region[] {
    return REGION_OPTIONS.filter(region => {
      if (hasChildren && !region.allowChildren) {
        return false;
      }

      if (isSmoking && !region.allowSmoking) {
        return false;
      }

      return true;
    });
  }


  // public createReservation(data: ReservationData): Observable<ReservationData> {
  //   // return this.http.post<ReservationData>(`${this.apiUrl}/reservations`, data);
  // }

  // public getReservationById(id: string): Observable<ReservationData> {
  //   // return this.http.get<ReservationData>(`${this.apiUrl}/reservations/${id}`);
  // }
}
