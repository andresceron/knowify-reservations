export type TimeSlot = '18:00' | '18:30' | '19:00' | '19:30' | '20:00' | '20:30' | '21:00' | '21:30' | '22:00';

export const TIME_SLOTS: TimeSlot[] = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];

export const TIME_SLOT_OPTIONS: { label: string; value: TimeSlot, disabled: boolean }[] = [
  { label: '18:00', value: '18:00', disabled: false },
  { label: '18:30', value: '18:30', disabled: false },
  { label: '19:00', value: '19:00', disabled: false },
  { label: '19:30', value: '19:30', disabled: false },
  { label: '20:00', value: '20:00', disabled: false },
  { label: '20:30', value: '20:30', disabled: false },
  { label: '21:00', value: '21:00', disabled: false },
  { label: '21:30', value: '21:30', disabled: false },
  { label: '22:00', value: '22:00', disabled: false },
];
