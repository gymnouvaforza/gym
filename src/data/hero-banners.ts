import { HeroBanner } from './types';

export const heroBanners: HeroBanner[] = [
  {
    id: 'banner-1',
    title: 'Tu fuerza no tiene límites',
    subtitle: 'El gimnasio premium para quienes buscan resultados reales y entrenamiento serio.',
    cta_primary: { label: 'Empezar ahora', href: '#planes' },
    cta_secondary: { label: 'Conocer local', href: '#local' },
    image: '/images/hero/banner-1.png',
    alignment: 'left',
    active: true
  },
  {
    id: 'banner-2',
    title: 'Equipamiento de Élite',
    subtitle: 'Máquinas de alta gama y zona de peso libre diseñada para el máximo rendimiento.',
    cta_primary: { label: 'Ver Equipamiento', href: '#equipo' },
    image: '/images/hero/banner-2.png',
    alignment: 'center',
    active: true
  },
  {
    id: 'banner-3',
    title: 'Comunidad Potente',
    subtitle: 'Únete a un grupo que comparte tus metas y te impulsa a ser mejor cada día.',
    cta_primary: { label: 'Unirse al equipo', href: '/auth/register' },
    image: '/images/hero/banner-3.png',
    alignment: 'right',
    active: true
  }
];
