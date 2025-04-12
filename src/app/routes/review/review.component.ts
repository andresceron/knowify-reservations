import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
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
    this.router.navigate(['/confirmation']);
  }

  editReservation(): void {
    this.router.navigate(['/reservation']);
  }
}
