import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class GuestValidators {
  static maxTotalGuests(maxGuests: number): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const adultsControl = formGroup.get('adults');
      const childrenControl = formGroup.get('children');

      if (!adultsControl || !childrenControl) {
        return null;
      }

      const adults = adultsControl.value || 0;
      const children = childrenControl.value || 0;

      if (adults + children > maxGuests) {
        return {
          maxTotalGuestsExceeded: {
            max: maxGuests,
            current: adults + children
          }
        };
      }

      return null;
    };
  }
}