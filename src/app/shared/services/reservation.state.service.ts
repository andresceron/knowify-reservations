import { Injectable, signal } from '@angular/core';
import { format, isDate } from 'date-fns';
import { Observable, tap, catchError, of, map, forkJoin, switchMap, firstValueFrom } from 'rxjs';
import { ReservationData } from '../interfaces/reservation.interface';
import { REGION_OPTIONS, RegionType } from '../types/region.type';
import { Region } from '../interfaces/region.interface';
import { SlotAvailability } from '../interfaces/slot.interface';
import { TIME_SLOTS } from '../types/time-slot.type';
import { FirestoreService } from './firestore.service';
import { doc, serverTimestamp } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class ReservationStateService {
  private readonly _reservation = signal<ReservationData | null>(null);
  readonly reservation = this._reservation.asReadonly();
  private readonly COLLECTION_RESERVATION = 'reservations';
  private readonly COLLECTION_SLOTS = 'slots';

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

    const { date, time, region } = reservationData;
    const availabilityPath = `${this.COLLECTION_SLOTS}/${date}/times/${time}/regions/${region}`;

    return this.firestoreService.listenToDocument<SlotAvailability>(availabilityPath).pipe(
      switchMap(availabilityData => {
        if (!availabilityData || availabilityData.availableTables <= 0) {
          throw new Error('No tables available for this time and region');
        }

        return this.firestoreService.runTransaction(transaction =>
          this.processReservationTransaction(
            transaction,
            reservationData,
            availabilityPath,
            availabilityData
          )
        );
      }),
      tap(id => {
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set(error.message || 'Failed to save reservation');
        this._loading.set(false);
        console.error('Error saving reservation:', error);
        return of('');
      })
    );
  }

  public getReservationById(id: string): Observable<ReservationData | null> {
    this._loading.set(true);
    this._error.set(null);

    return this.firestoreService.getDocument<ReservationData>(this.COLLECTION_RESERVATION, id).pipe(
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

    const timeChecks$ = TIME_SLOTS.map((time: string) => {
      const path = `slots/${date}/times/${time}/regions`;
      return this.firestoreService.getCollection<SlotAvailability>(path).pipe(
        map(regionDocs => ({
          time,
          available: regionDocs.some(region => region.availableTables > 0)
        }))
      );
    });

    return forkJoin(timeChecks$).pipe(
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

  public checkRegionAvailability(date: string, time: string, region: RegionType, totalGuests: number): Observable<boolean> {
    this._loading.set(true);
    this._error.set(null);

    const path = `${date}/times/${time}/regions/${region}`;
    return this.firestoreService.getDocument<SlotAvailability>(this.COLLECTION_SLOTS, path).pipe(
      map(regionData => {
        if (!regionData) {
          return false;
        }

        if (regionData.availableTables <= 0) {
          return false;
        }

        const tablesNeeded = Math.ceil(totalGuests / regionData.capacityPerTable);
        const hasEnoughTables = tablesNeeded <= regionData.availableTables;
        return hasEnoughTables;
      }),
      tap(() => this._loading.set(false)),
      catchError(error => {
        this._error.set('Failed to check region availability');
        this._loading.set(false);
        console.error('Error checking region availability:', error);
        return of(false);
      })
    );
  }

  public listenToRegionAvailability(date: string, time: string, region: RegionType, totalGuests: number): Observable<boolean> {
    const regionPath = `slots/${date}/times/${time}/regions/${region}`;

    return this.firestoreService.listenToDocument<SlotAvailability>(regionPath).pipe(
      map(regionData => {
        if (!regionData) {
          return false;
        }

        const tablesNeeded = Math.ceil(totalGuests / regionData.capacityPerTable);
        return tablesNeeded <= regionData.availableTables;
      }),
      catchError(error => {
        console.error('Error listening to region availability:', error);
        this._error.set('Failed to monitor region availability');
        return of(false);
      })
    );
  }

  private processReservationTransaction(
    transaction: any,
    reservationData: ReservationData,
    availabilityPath: string,
    availabilityData: SlotAvailability
  ): Promise<string> {
    const transactionObservable = of(null).pipe(
      map(() => {
        const availabilityDocRef = this.firestoreService.getDocRef(availabilityPath);

        transaction.update(availabilityDocRef, {
          availableTables: availabilityData.availableTables - 1
        });

        const reservationRef = this.firestoreService.getCollectionRef(this.COLLECTION_RESERVATION);
        const newDocRef = doc(reservationRef);
        const reservationId = newDocRef.id;

        transaction.set(newDocRef, {
          ...reservationData,
          id: reservationId,
          createdAt: serverTimestamp()
        });

        return reservationId;
      }),
      catchError(error => {
        console.error('Error in transaction:', error);
        throw error;
      })
    );

    return firstValueFrom(transactionObservable);
  }
}
