import { Schedule } from './types';

export const schedules: Schedule[] = [
  { day: 'Lunes', opens_at: '05:00', closes_at: '23:00' },
  { day: 'Martes', opens_at: '05:00', closes_at: '23:00' },
  { day: 'Miércoles', opens_at: '05:00', closes_at: '23:00' },
  { day: 'Jueves', opens_at: '05:00', closes_at: '23:00' },
  { day: 'Viernes', opens_at: '05:00', closes_at: '23:00' },
  { day: 'Sábado', opens_at: '07:00', closes_at: '20:00' },
  { day: 'Domingo', opens_at: '08:00', closes_at: '14:00', notes: 'Feriados consultar horarios especiales' }
];
