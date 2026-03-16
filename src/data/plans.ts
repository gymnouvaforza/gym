import { Plan } from './types';

export const plans: Plan[] = [
  {
    id: 'plan-basic',
    slug: 'basic-forza',
    name: 'Basic Forza',
    short_description: 'Entrenamiento esencial con acceso total.',
    price: 120,
    currency: 'S/',
    billing_period: 'mensual',
    features: [
      'Acceso libre 24/7 (según sede)',
      '1 Sesión de inducción',
      'Uso de lockers y duchas',
      'Acceso a zona de peso libre'
    ],
    highlighted: false,
    order: 1,
    active: true
  },
  {
    id: 'plan-pro',
    slug: 'power-pro',
    name: 'Power Pro',
    short_description: 'Para quienes buscan un seguimiento real.',
    price: 180,
    currency: 'S/',
    billing_period: 'mensual',
    features: [
      'Todo lo del plan Basic',
      'Plan de entrenamiento personalizado',
      'Evaluación de composición corporal mensual',
      'Seguimiento por APP propia'
    ],
    highlighted: true,
    order: 2,
    active: true
  },
  {
    id: 'plan-elite',
    slug: 'elite-performance',
    name: 'Elite Performance',
    short_description: 'Máximo rendimiento y asesoría experta.',
    price: 250,
    currency: 'S/',
    billing_period: 'mensual',
    features: [
      'Todo lo del plan Power Pro',
      'Asesoría nutricional personalizada',
      'Acceso a talleres de técnica semanales',
      '2 Invitaciones para amigos al mes'
    ],
    highlighted: false,
    order: 3,
    active: true
  },
  {
    id: 'plan-annual',
    slug: 'annual-legend',
    name: 'Annual Legend',
    short_description: 'La mejor inversión a largo plazo.',
    price: 1500,
    currency: 'S/',
    billing_period: 'anual',
    features: [
      'Todo lo del plan Elite',
      'Precio especial por pago adelantado',
      'Kit de bienvenida Nova Forza',
      'Congelamiento de membresía hasta 30 días'
    ],
    highlighted: false,
    order: 4,
    active: true
  }
];
