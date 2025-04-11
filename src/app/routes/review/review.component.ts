import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { ReservationStateService } from '../../shared/services/reservation.state.service';
import { ReservationData } from '../../shared/interfaces/reservation.interface';
import { REGION_OPTIONS } from '../../shared/types/region.type';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './review.component.html',
  styleUrl: './review.component.scss'
})
export class ReviewComponent implements OnInit {
  public reservation: ReservationData | null = null;
  public regionName = '';

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

    const region = REGION_OPTIONS.find(r => r.value === this.reservation?.region);
    this.regionName = region?.label || '';
  }

  confirmReservation(): void {
    this.router.navigate(['/confirmation']);
  }

  editReservation(): void {
    this.router.navigate(['/reservation']);
  }
}
