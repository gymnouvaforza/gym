export interface Plan {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  price: number;
  currency: string;
  billing_period: 'mensual' | 'anual' | 'trimestral';
  features: string[];
  highlighted: boolean;
  order: number;
  active: boolean;
}

export interface Schedule {
  day: string;
  opens_at: string;
  closes_at: string;
  notes?: string;
}

export interface Trainer {
  id: string;
  slug: string;
  name: string;
  role: string;
  specialty: string;
  short_bio: string;
  image: string;
  social_instagram?: string;
  order: number;
  active: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: 'suplementos' | 'accesorios' | 'merchandising';
  short_description: string;
  price: number;
  currency: string;
  stock_status: 'in_stock' | 'out_of_stock' | 'low_stock';
  pickup_only: boolean;
  featured: boolean;
  image: string;
  order: number;
  active: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  age_range?: string;
  goal: string;
  quote: string;
  result_summary: string;
  image?: string;
  order: number;
  active: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  active: boolean;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  cta_primary: { label: string; href: string };
  cta_secondary?: { label: string; href: string };
  image: string;
  alignment: 'left' | 'center' | 'right';
  active: boolean;
}

export interface ValueProp {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}
