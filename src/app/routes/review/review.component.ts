import { Component, inject, DestroyRef, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReservationStateService } from '../../shared/services/reservation.state.service';
import { ReservationData } from '../../shared/interfaces/reservation.interface';
import { ReservationDetailsComponent } from '../../shared/components/reservation-details/reservation-details.component';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [
    ButtonModule,
    ReservationDetailsComponent,
    MessageModule,
    CommonModule,
  ],
  templateUrl: './review.component.html',
  styleUrl: './review.component.scss'
})
export class ReviewComponent implements OnInit {
  public reservation: ReservationData | null = null;
  public isSubmitting = false;
  public isAvailable = true;
  public errorMessage: string | undefined;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private reservationState: ReservationStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.reservation = this.reservationState.reservation();
    if (!this.reservation) {
      this.router.navigate(['/']);
      return;
    }

    this.setupRealTimeAvailabilityMonitoring();
  }

  private setupRealTimeAvailabilityMonitoring(): void {
    if (!this.reservation) {
      return;
    }

    this.reservationState.listenToRegionAvailability(
      this.reservation.date,
      this.reservation.time,
      this.reservation.region,
      (this.reservation.adults + this.reservation.children)
    ).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((regionAvailable) => {
      this.isAvailable = regionAvailable;
      this.errorMessage = 'This reservation is no longer available. Please modify your selection.';
    });
  }

  confirmReservation(): void {
    if (this.isAvailable) {
      this.submitReservation();
    }
  }

  private submitReservation(): void {
    this.isSubmitting = true;
    this.reservationState.createReservation().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (reservationId) => {
        this.isSubmitting = false;
        if (reservationId) {
          this.router.navigate(['/confirmation', reservationId]);
        }
      },
      error: (error) => {
        console.error('Error confirming reservation:', error);
        this.isSubmitting = false;
        this.errorMessage = 'Failed to confirm reservation. Please try again.';
      }
    });
  }

  editReservation(): void {
    this.router.navigate(['/reservation']);
  }
}
