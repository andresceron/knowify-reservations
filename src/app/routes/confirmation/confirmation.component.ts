import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationStateService } from '../../shared/services/reservation.state.service';
import { ReservationData } from '../../shared/interfaces/reservation.interface';
import { ReservationDetailsComponent } from '../../shared/components/reservation-details/reservation-details.component';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [
    ButtonModule,
    ReservationDetailsComponent,
  ],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.scss'
})
export class ConfirmationComponent implements OnInit {
  public reservation: ReservationData | null = null;
  public confirmationNumber = '';
  public loading = true;

  constructor(
    private reservationState: ReservationStateService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    const confirmationId = this.route.snapshot.paramMap.get('id');
    if (confirmationId) {
      this.fetchReservationById(confirmationId);
      this.reservation = this.reservationState.reservation();
    } else {
      this.createNewReservation();
    }
  }

  public createNewReservation(): void {
    this.reservationState.reset();
    this.router.navigate(['/']);
  }

  private fetchReservationById(id: string): void {
    // TBD
  }
}