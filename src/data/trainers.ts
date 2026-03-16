import { Trainer } from './types';

export const trainers: Trainer[] = [
  {
    id: 'trainer-1',
    slug: 'marco-santillan',
    name: 'Marco "Toro" Santilllán',
    role: 'Head Coach',
    specialty: 'Powerlifting & Fuerza Extrema',
    short_bio: '10 años transformando atletas. Especialista en optimización de levantamientos olímpicos.',
    image: '/images/trainers/trainer-1.png',
    social_instagram: 'https://instagram.com/marco_toro',
    order: 1,
    active: true
  },
  {
    id: 'trainer-2',
    slug: 'elena-rios',
    name: 'Elena Ríos',
    role: 'Senior Trainer',
    specialty: 'Recomposición Femenina',
    short_bio: 'Especialista en nutrición deportiva y entrenamiento de fuerza para mujeres.',
    image: '/images/trainers/trainer-2.png',
    social_instagram: 'https://instagram.com/elena_fitness',
    order: 2,
    active: true
  },
  {
    id: 'trainer-3',
    slug: 'ricardo-pardo',
    name: 'Ricardo Pardo',
    role: 'Pro Coach',
    specialty: 'Culturismo Natural',
    short_bio: 'Ex-atleta nacional con enfoque en hipertrofia y estética funcional.',
    image: '/images/trainers/trainer-3.png',
    social_instagram: 'https://instagram.com/ricardo_pardo_fit',
    order: 3,
    active: true
  },
  {
    id: 'trainer-4',
    slug: 'javier-solis',
    name: 'Javier Solis',
    role: 'Mobility Expert',
    specialty: 'Rehabilitación & Movilidad',
    short_bio: 'Fisioterapeuta y coach enfocado en la longevidad y salud articular.',
    image: '/images/trainers/trainer-4.png',
    order: 4,
    active: true
  }
];
