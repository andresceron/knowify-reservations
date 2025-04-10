import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { StepperModule } from 'primeng/stepper';
import { TIME_SLOT_OPTIONS } from '../../shared/types/time-slot.type';
import { REGION_OPTIONS } from '../../shared/types/region.type';

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
  public guestsOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  public isReservationInitiated = false;
  public currentStep = 0;

  constructor(private fb: FormBuilder) {
  }

  public ngOnInit(): void {
    this.form = this.fb.group({
      date: [null, Validators.required],
      time: [null, Validators.required],
      adults: [null, [Validators.required, Validators.min(1), Validators.max(12)]],
      children: [null, [Validators.required, Validators.min(0), Validators.max(12)]],
      region: [null, Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+[0-9\s]{8,15}$/)]],
      isSmoking: [false],
      isBirthday: [false],
      birthdayName: [''],
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
      }
    } else {
      this.markCurrentStepAsTouched();
    }
  }

  public submitForm(): void {
    if (this.form.valid) {
      console.log('Form submitted');
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
          this.form.get('children')?.valid
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
}
