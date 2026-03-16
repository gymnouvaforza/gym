import { Testimonial } from './types';

export const testimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Carlos Gamboa',
    age_range: '25-35',
    goal: 'Ganancia de Fuerza',
    quote: 'Por fin un gym donde se puede entrenar pesado sin que te miren raro. El equipamiento es de otro nivel.',
    result_summary: '+40kg en Sentadilla en 6 meses',
    image: '/images/testimonials/user-1.png',
    order: 1,
    active: true
  },
  {
    id: 'test-2',
    name: 'María Fernanda',
    age_range: '18-24',
    goal: 'Recomposición Corporal',
    quote: 'Bajé 8kg de grasa y subí mi peso muerto significativamente. El acompañamiento de los coaches es A1.',
    result_summary: 'Transformación física integral',
    image: '/images/testimonials/user-2.png',
    order: 2,
    active: true
  },
  {
    id: 'test-3',
    name: 'Juan Pablo Ruiz',
    age_range: '30-40',
    goal: 'Salud y Longevidad',
    quote: 'La mejor inversión que he hecho este año. La comunidad es increíble y el ambiente muy profesional.',
    result_summary: 'Mejora notable en postura y movilidad',
    image: '/images/testimonials/user-3.png',
    order: 3,
    active: true
  },
  {
    id: 'test-4',
    name: 'Andrea Beltrán',
    age_range: '25-35',
    goal: 'Hipertrofia',
    quote: 'Las máquinas de palanca y la zona de pesas libres son las mejores de la zona. 100% recomendado.',
    result_summary: 'Ganancia de 3kg de masa muscular pura',
    image: '/images/testimonials/user-4.png',
    order: 4,
    active: true
  },
  {
    id: 'test-5',
    name: 'Roberto Vaca',
    age_range: '40+',
    goal: 'Fuerza Vital',
    quote: 'A mis 45 años nunca me sentí tan fuerte. Los planes personalizados realmente funcionan.',
    result_summary: 'Recuperación de vitalidad y fuerza funcional',
    image: '/images/testimonials/user-5.png',
    order: 5,
    active: true
  },
  {
    id: 'test-6',
    name: 'Sofía Castro',
    age_range: '18-24',
    goal: 'Powerlifting',
    quote: 'Entrenar en Nova Forza me dio la confianza para mi primera competencia. El ambiente es puro power.',
    result_summary: 'Podio en regional de powerlifting',
    image: '/images/testimonials/user-6.png',
    order: 6,
    active: true
  }
];
