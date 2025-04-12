import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ReservationData } from '../../interfaces/reservation.interface';
import { REGION_OPTIONS } from '../../types/region.type';

@Component({
  selector: 'app-reservation-details',
  standalone: true,
  imports: [],
  templateUrl: './reservation-details.component.html',
  styleUrl: './reservation-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationDetailsComponent implements OnInit {
  @Input() reservation: ReservationData | null = null;
  public regionName = '';

  public ngOnInit(): void {
    if (this.reservation) {
      const region = REGION_OPTIONS.find(r => r.value === this.reservation?.region);
      this.regionName = region?.label || '';
    }
  }
}
