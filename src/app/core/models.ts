export interface Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'guest' | 'host' | 'admin';
  phone?: string;
  avatar?: string;
  bio?: string;
  is_suspended: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  properties_count?: number;
}

export interface Amenity {
  id: number;
  name: string;
  icon: string;
}

export interface PropertyImage {
  id: number;
  property: number;
  image: string;
  caption: string;
  is_cover: boolean;
}

export interface Property {
  id: number;
  host: string;
  host_id: number;
  title: string;
  description: string;
  property_type: string;
  address: string;
  city: string;
  country: string;
  price_per_night: string;
  cleaning_fee: string;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: string;
  amenities: Amenity[];
  images: PropertyImage[];
  average_rating: number | null;
  review_count: number;
  is_active: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  is_reported: boolean;
  moderation_note: string;
}

export interface Booking {
  id: number;
  property: number;
  property_title: string;
  host_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  status: string;
  dispute_status: 'none' | 'open' | 'reviewing' | 'resolved';
  dispute_reason: string;
  dispute_resolution: string;
  total_price: string;
  created_at?: string;
  updated_at?: string;
}

export interface Review {
  id: number;
  guest: string;
  property: number;
  property_title: string;
  rating: number;
  comment: string;
  moderation_status: 'clean' | 'reported' | 'hidden' | 'resolved';
  moderation_note: string;
  created_at: string;
}

export interface Notification {
  id: number;
  user: number;
  user_name: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface WishlistItem {
  id: number;
  property: number;
  property_detail: Property;
  created_at: string;
}
