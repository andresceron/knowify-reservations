import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { format, parse } from 'date-fns';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { StepperModule } from 'primeng/stepper';
import { of, switchMap, tap } from 'rxjs';
import { TIME_SLOT_OPTIONS } from '../../shared/types/time-slot.type';
import { REGION_OPTIONS } from '../../shared/types/region.type';
import { ReservationStateService } from '../../shared/services/reservation.state.service';
import { Router } from '@angular/router';
import { AVAILABILITY_DATE_RANGE } from '../../shared/types/date-availability';
import { GuestValidators } from '../../shared/validators/guest-validators';
import { MAX_TOTAL_GUESTS } from '../../shared/constants/global.constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-reservation',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    CheckboxModule,
    RadioButtonModule,
    StepperModule,
  ],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss',
})
export class ReservationComponent implements OnInit {
  public form!: FormGroup;
  public regions = REGION_OPTIONS;
  public timeSlotsOptions = TIME_SLOT_OPTIONS;
  public dateAvailability = AVAILABILITY_DATE_RANGE;
  public guestsOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  public isReservationInitiated = false;
  public currentStep = 0;
  public maxTotalGuests = MAX_TOTAL_GUESTS;
  public noRegionsAvailable = false;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private reservationState: ReservationStateService,
    private router: Router,
  ) {
  }

  public ngOnInit(): void {
    const existingReservation = this.reservationState.reservation();
    const dateObj = existingReservation?.date ? parse(existingReservation.date, 'yyyy-MM-dd', new Date()) : null;

    this.form = this.fb.group({
      date: [dateObj, Validators.required],
      time: [existingReservation?.time || null, Validators.required],
      adults: [existingReservation?.adults || null, [Validators.required, Validators.min(1), Validators.max(12)]],
      children: [existingReservation?.children || null, [Validators.required, Validators.min(0), Validators.max(12)]],
      region: [existingReservation?.region || null, Validators.required],
      name: [existingReservation?.name || '', Validators.required],
      email: [existingReservation?.email || '', [Validators.required, Validators.email]],
      phone: [existingReservation?.phone || '', [Validators.required, Validators.pattern(/^\+[0-9\s]{8,15}$/)]],
      isSmoking: [existingReservation?.isSmoking || false],
      isBirthday: [existingReservation?.isBirthday || false],
      birthdayName: [existingReservation?.birthdayName || ''],
    }, { validators: GuestValidators.maxTotalGuests(this.maxTotalGuests) });

    if (!this.form.get('date')?.value) {
      this.form.get('time')?.disable();
    }

    if (existingReservation) {
      this.initReservation();
    }

    this.form.get('date')?.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(() => this.form.get('time')?.reset()),
      tap((dateValue) => dateValue ? this.form.get('time')?.enable() : this.form.get('time')?.disable()),
      switchMap((date: Date) => {
        if (!date) {
          return of([]);
        }
        const formattedDate = format(date, 'yyyy-MM-dd');
        return this.reservationState.getAvailableTimes(formattedDate);
      })
    ).subscribe((availableTimes: string[]) => {
      this.timeSlotsOptions = TIME_SLOT_OPTIONS.map(slot => ({
        ...slot,
        disabled: !availableTimes.includes(slot.value)
      }));
    });
  }

  public initReservation(): void {
    this.isReservationInitiated = true;
    this.currentStep = 1;
  }

  public goToPreviousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  public goToNextStep(): void {
    if (this.validateCurrentStep()) {
      if (this.currentStep < 4) {
        this.currentStep++;

        if (this.currentStep === 3) {
          this.updateRegionAvailability();
        }
      }
    } else {
      this.markCurrentStepAsTouched();
    }
  }

  public submitForm(): void {
    if (this.form.valid) {
      this.reservationState.setReservation(this.form.value);
      this.router.navigate(['/review']);
    } else {
      this.form.markAllAsTouched();
    }
  }

  private validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return (
          this.form.get('date')?.valid &&
          this.form.get('time')?.valid
        ) ?? false;
      case 2:
        return (
          this.form.get('adults')?.valid &&
          this.form.get('children')?.valid &&
          !this.form.hasError('maxTotalGuestsExceeded')
        ) ?? false;
      case 3:
        return this.form.get('region')?.valid ?? false;
      case 4:
        return (
          this.form.get('name')?.valid &&
          this.form.get('email')?.valid &&
          this.form.get('phone')?.valid
        ) ?? false;
      default:
        return false;
    }
  }

  private markCurrentStepAsTouched(): void {
    switch (this.currentStep) {
      case 1:
        this.form.get('date')?.markAsTouched();
        this.form.get('time')?.markAsTouched();
        break;
      case 2:
        this.form.get('adults')?.markAsTouched();
        this.form.get('children')?.markAsTouched();
        break;
      case 3:
        this.form.get('region')?.markAsTouched();
        break;
      case 4:
        this.form.get('name')?.markAsTouched();
        this.form.get('email')?.markAsTouched();
        this.form.get('phone')?.markAsTouched();
        break;
    }
  }

  get hasMaxTotalGuestsError(): boolean {
    return this.form.hasError('maxTotalGuestsExceeded');
  }

  private updateRegionAvailability(): void {
    const hasChildren = this.form.get('children')?.value > 0;
    const isSmoking = this.form.get('isSmoking')?.value;
    const regionControl = this.form.get('region') as FormControl;

    this.regions.forEach(region => {
      const isAvailable = (!hasChildren || region.allowChildren) && (!isSmoking || region.allowSmoking);
      region.disabled = !isAvailable;

      if (regionControl.value === region.value && !isAvailable) {
        regionControl.setValue(null);
      }
    });

    this.noRegionsAvailable = !this.regions.some(region => !region.disabled);
  }
}
