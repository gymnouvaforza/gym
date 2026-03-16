import { FAQ } from './types';

export const faqs: FAQ[] = [
  {
    id: 'faq-1',
    question: '¿Tienen estacionamiento?',
    answer: 'Sí, contamos con zona segura de estacionamiento para clientes en los alrededores del local.',
    order: 1,
    active: true
  },
  {
    id: 'faq-2',
    question: '¿Cuentan con nutricionista?',
    answer: 'Sí, los planes Power Pro y Elite Performance incluyen asesoría nutricional personalizada.',
    order: 2,
    active: true
  },
  {
    id: 'faq-3',
    question: '¿Puedo ir por un día?',
    answer: 'Sí, contamos con pases diarios por S/ 30 que te dan acceso completo a las instalaciones por una jornada.',
    order: 3,
    active: true
  },
  {
    id: 'faq-4',
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos Yape, Plin, transferencia bancaria y todas las tarjetas de crédito/débito.',
    order: 4,
    active: true
  },
  {
    id: 'faq-5',
    question: '¿Hay entrenadores en sala?',
    answer: 'Siempre hay un entrenador de turno disponible para guiarte, corregir técnica y resolver dudas.',
    order: 5,
    active: true
  },
  {
    id: 'faq-6',
    question: '¿Cómo funciona la membresía 24/7?',
    answer: 'Contamos con un sistema de acceso electrónico para miembros que permite entrenar fuera del horario administrativo.',
    order: 6,
    active: true
  }
];
