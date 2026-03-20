export type EventStatus = 'active' | 'full' | 'cancelled' | 'archived'
export type ReservationStatus = 'confirmed' | 'cancelled'
export type GroupType = 'solo' | 'couple' | 'family'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Event {
  id: string
  organizer_id: string
  title: string
  description: string | null
  slug: string
  date_time: string
  max_seats: number
  status: EventStatus
  children_allowed: boolean
  pets_allowed: boolean
  created_at: string
  updated_at: string
  // Joined fields
  organizer?: Profile
  reservations_count?: number
  confirmed_seats?: number
}

export interface Pets {
  dog: number
  cat: number
  other: number
}

export interface Reservation {
  id: string
  event_id: string
  user_id: string
  status: ReservationStatus
  group_type: GroupType
  children_count: number
  pets: Pets | null
  created_at: string
  cancelled_at: string | null
  // Joined fields
  event?: Event
  user?: Profile
}

export interface EventWithDetails extends Event {
  organizer: Profile
  confirmed_seats: number
  reservations: (Reservation & { user: Profile })[]
}

export interface CreateEventPayload {
  title: string
  description?: string
  date_time: string
  max_seats: number
  children_allowed: boolean
  pets_allowed: boolean
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {
  id: string
}

export interface ReservationExtras {
  group_type: GroupType
  children_count: number
  pets: Pets | null
}
