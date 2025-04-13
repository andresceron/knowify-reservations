import { Injectable, signal } from '@angular/core';
import { format, isDate } from 'date-fns';
import { Observable, tap, catchError, of, map, forkJoin, switchMap } from 'rxjs';
import { ReservationData } from '../interfaces/reservation.interface';
import { REGION_OPTIONS } from '../types/region.type';
import { Region } from '../interfaces/region.interface';
import { SlotAvailability } from '../interfaces/slot.interface';
import { TIME_SLOTS } from '../types/time-slot.type';
import { FirestoreService } from './firestore.service';

@Injectable({ providedIn: 'root' })
export class ReservationStateService {
  private readonly _reservation = signal<ReservationData | null>(null);
  readonly reservation = this._reservation.asReadonly();
  private readonly COLLECTION_NAME = 'reservations';

  private readonly _loading = signal(false);
  public loading = this._loading.asReadonly();

  private readonly _error = signal<string | null>(null);
  public error = this._error.asReadonly();

  constructor(private firestoreService: FirestoreService) {}

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

  public createReservation(): Observable<string> {
    this._loading.set(true);
    this._error.set(null);

    const reservationData = this._reservation();
    if (!reservationData) {
      this._error.set('No reservation data to save');
      this._loading.set(false);
      return of('');
    }

    return this.firestoreService.addDocument(this.COLLECTION_NAME, reservationData).pipe(
      tap(id => {
        this._loading.set(false);
        return id;
      }),
      catchError(error => {
        this._error.set('Failed to save reservation');
        this._loading.set(false);
        console.error('Error saving reservation:', error);
        return of('');
      })
    );
  }

  public getReservationById(id: string): Observable<ReservationData | null> {
    this._loading.set(true);
    this._error.set(null);

    return this.firestoreService.getDocument<ReservationData>(this.COLLECTION_NAME, id).pipe(
      tap(reservation => {
        if (reservation) {
          this._reservation.set(reservation);
        }
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set('Failed to fetch reservation');
        this._loading.set(false);
        console.error('Error fetching reservation:', error);
        return of(null);
      })
    );
  }

  public getAvailableTimes(date: string): Observable<string[]> {
    this._loading.set(true);
    this._error.set(null);

    if (!date) {
      this._loading.set(false);
      return of(TIME_SLOTS);
    }

    return this.firestoreService.getCollection<any>(`slots/${date}/times`).pipe(
      switchMap(times => {
        const timeIds = times.map(t => t.id);

        const timesToCheck = timeIds.length > 0 ? timeIds : TIME_SLOTS;

        const timeChecks$ = timesToCheck.map((time: string) => {
          const path = `slots/${date}/times/${time}/regions`;
          return this.firestoreService.getCollection<SlotAvailability>(path).pipe(
            map(regionDocs => ({
              time,
              available: regionDocs.some(region => region.availableTables > 0)
            }))
          );
        });

        return forkJoin(timeChecks$);
      }),
      map(results =>
        results.filter(r => r.available).map(r => r.time)
      ),
      tap(() => this._loading.set(false)),
      catchError(error => {
        this._error.set('Failed to fetch available time slots');
        this._loading.set(false);
        console.error('Error fetching time slots:', error);
        return of([]);
      })
    );
  }
}
