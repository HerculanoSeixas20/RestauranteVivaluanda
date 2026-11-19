export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  order: number;
  description?: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  priceDisplay: string;
  imageUrl?: string;
  featured: boolean;
  order: number;
}

export type ReservationStatus = 'Pendente' | 'Confirmada' | 'Cancelada';

export interface ReservationRequest {
  id: string;
  referenceCode: string;
  fullName: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  guests: number;
  notes?: string;
  status: ReservationStatus;
  createdAt: string;
}

export interface RestaurantSettings {
  instagramUrl: string;
  facebookUrl: string;
  whatsappNumber: string;
  phoneDisplay: string;
}

export interface MenuPayload {
  categories: MenuCategory[];
  items: MenuItem[];
  settings: RestaurantSettings;
}
