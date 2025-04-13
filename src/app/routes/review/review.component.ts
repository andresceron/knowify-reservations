import { Component, inject, DestroyRef, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReservationStateService } from '../../shared/services/reservation.state.service';
import { ReservationData } from '../../shared/interfaces/reservation.interface';
import { ReservationDetailsComponent } from '../../shared/components/reservation-details/reservation-details.component';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [
    ButtonModule,
    ReservationDetailsComponent,
  ],
  templateUrl: './review.component.html',
  styleUrl: './review.component.scss'
})
export class ReviewComponent implements OnInit {
  public reservation: ReservationData | null = null;
  public isSubmitting = false;
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
  }

  confirmReservation(): void {
    this.isSubmitting = true;
    this.reservationState.createReservation().
      pipe(
        takeUntilDestroyed(this.destroyRef)
    ).subscribe(
      {
        next: (reservationId) => {
          this.isSubmitting = false;
          if (reservationId) {
            this.router.navigate(['/confirmation', reservationId]);
          }
        },
        error: (error) => {
          console.error('Error confirming reservation:', error);
          this.isSubmitting = false;
        }
      }
    );
  }

  editReservation(): void {
    this.router.navigate(['/reservation']);
  }
}
