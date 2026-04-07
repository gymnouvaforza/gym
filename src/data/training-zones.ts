export type TrainingZoneIcon = "dumbbell" | "flame" | "heart-pulse" | "users" | "bike";

export interface TrainingZone {
  id: string;
  slug: string;
  title: string;
  short_label: string;
  subtitle?: string;
  description: string;
  icon: TrainingZoneIcon;
  video: string;
  poster?: string;
  cta_label?: string;
  cta_href?: string;
  order: number;
  active: boolean;
}

export const trainingZones: TrainingZone[] = [
  {
    id: "zone-1",
    slug: "peso-libre",
    title: "Zona de peso libre",
    short_label: "Fuerza",
    subtitle: "Racks, barras olimpicas y mancuernas para meterle en serio.",
    description:
      "El espacio clave para construir fuerza real con libertad de movimiento, buena tecnica y progresion bien medida.",
    icon: "dumbbell",
    video: "/video/train/peso_libre.mp4",
    poster: "/video/train/posters/peso_libre.jpg",
    cta_label: "Ver planes",
    cta_href: "#planes",
    order: 1,
    active: true,
  },
  {
    id: "zone-2",
    slug: "alta-intensidad",
    title: "Alta intensidad",
    short_label: "HIIT",
    subtitle: "Sesiones explosivas para subir pulsaciones y sostener ritmo.",
    description:
      "Bloques dinamicos para quienes quieren salir drenados, trabajar fuerte y llevar su resistencia a otro nivel.",
    icon: "flame",
    video: "/video/train/alta_intensidad.mp4",
    poster: "/video/train/posters/alta_intensidad.jpg",
    cta_label: "Reservar prueba",
    cta_href: "#contacto",
    order: 2,
    active: false,
  },
  {
    id: "zone-3",
    slug: "cardio",
    title: "Acondicionamiento cardio",
    short_label: "Cardio",
    subtitle: "Base aerobia y capacidad para complementar cualquier objetivo.",
    description:
      "Cintas, remos y estaciones de trabajo para quemar, mejorar fondo fisico y sumar condicion sin perder foco.",
    icon: "heart-pulse",
    video: "/video/train/cardio.mp4",
    poster: "/video/train/posters/cardio.jpg",
    cta_label: "Ver horarios",
    cta_href: "#horarios",
    order: 3,
    active: false,
  },
  {
    id: "zone-4",
    slug: "actividades-dirigidas",
    title: "Actividades dirigidas",
    short_label: "Clases",
    subtitle: "Energia compartida, guia clara y sesiones con buen ritmo.",
    description:
      "Entrena en grupo con sesiones guiadas que te ayudan a mantener constancia, tecnica y motivacion sin perder calidad.",
    icon: "users",
    video: "/video/train/actividades_dirigidas.mp4",
    poster: "/video/train/posters/actividades_dirigidas.jpg",
    cta_label: "Hablar con un asesor",
    cta_href: "#contacto",
    order: 4,
    active: false,
  },
  {
    id: "zone-5",
    slug: "ciclo-indoor",
    title: "Ciclo indoor",
    short_label: "Ciclo",
    subtitle: "Trabajo intenso con musica, ritmo y una sala que empuja.",
    description:
      "Una experiencia inmersiva para quienes quieren quemar calorias, sumar resistencia y salir con la cabeza limpia.",
    icon: "bike",
    video: "/video/train/ciclo.mp4",
    poster: "/video/train/posters/ciclo.jpg",
    cta_label: "Agendar visita",
    cta_href: "#contacto",
    order: 5,
    active: false,
  },
];

export const trainingZonesSectionCopy = {
  kicker: "Zonas de entrenamiento",
  title: "Espacios para rendir mejor en cada sesion",
  intro:
    "Desde fuerza pura hasta trabajo metabolico, Nuova Forza organiza sus zonas para que elijas rapido, entrenes mejor y entiendas lo que pasa en el piso desde el primer dia.",
};

export function getOrderedTrainingZones() {
  return [...trainingZones].sort((left, right) => left.order - right.order);
}

export function getInitialTrainingZone() {
  const orderedZones = getOrderedTrainingZones();
  return orderedZones.find((zone) => zone.active) ?? orderedZones[0];
}
