import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import {
  createServiceRoleClient,
  sendEmail,
  reservationConfirmedEmail,
  eventFullEmail,
  formatEmailDate,
  formatEmailTime,
} from '~/server/utils'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }

  const body = await readBody(event)
  const { event_id, children_count = 0, pets = null } = body

  if (!event_id) {
    throw createError({ statusCode: 400, statusMessage: 'event_id requis' })
  }

  const supabase = await serverSupabaseClient(event)
  const serviceClient = createServiceRoleClient()

  // Get event
  const { data: eventData, error: eventError } = await serviceClient
    .from('events')
    .select('*')
    .eq('id', event_id)
    .single()

  if (eventError || !eventData) {
    throw createError({ statusCode: 404, statusMessage: 'Événement introuvable' })
  }

  // Get organizer profile separately (no direct FK events→profiles)
  const { data: organizerProfile } = await serviceClient
    .from('profiles')
    .select('full_name, id')
    .eq('id', eventData.organizer_id)
    .single()
  const organizer = organizerProfile ?? null

  if (eventData.status !== 'active') {
    const msgs: Record<string, string> = {
      full: 'Le repas est complet',
      cancelled: 'Le repas a été annulé',
      archived: 'Le repas est passé',
    }
    throw createError({
      statusCode: 409,
      statusMessage: msgs[eventData.status] ?? 'Réservation impossible',
    })
  }

  // Check for existing reservation
  const { data: existing } = await serviceClient
    .from('reservations')
    .select('id, status')
    .eq('event_id', event_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing?.status === 'confirmed') {
    throw createError({ statusCode: 409, statusMessage: 'Tu as déjà réservé ce repas' })
  }

  // Create or reactivate reservation
  let reservation
  if (existing) {
    const { data, error } = await serviceClient
      .from('reservations')
      .update({ status: 'confirmed', cancelled_at: null })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    reservation = data
  } else {
    const { data, error } = await serviceClient
      .from('reservations')
      .insert({ event_id, user_id: user.id, children_count, pets })
      .select()
      .single()
    if (error) {
      if (error.code === '23505') {
        throw createError({ statusCode: 409, statusMessage: 'Tu as déjà réservé ce repas' })
      }
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
    reservation = data
  }

  // Get user profile for email
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const guestName = profile?.full_name || user.email || 'Invité'
  const config = useRuntimeConfig()
  const appUrl = config.public.appUrl

  // Send confirmation email
  const confirmEmail = reservationConfirmedEmail({
    guestName,
    eventTitle: eventData.title,
    eventDate: formatEmailDate(eventData.date_time),
    eventTime: formatEmailTime(eventData.date_time),
    organizerName: organizer?.full_name ?? 'L\'organisateur',
    eventUrl: `${appUrl}/e/${eventData.slug}`,
  })
  await sendEmail({ ...confirmEmail, to: user.email! })

  // Check if event is now full and notify organizer
  const { count } = await serviceClient
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event_id)
    .eq('status', 'confirmed')

  if (count !== null && count >= eventData.max_seats) {
    // Get organizer email
    const { data: organizerData } = await serviceClient.auth.admin.getUserById(
      eventData.organizer_id,
    )
    if (organizerData?.user?.email) {
      const fullEmail = eventFullEmail({
        organizerName: organizer?.full_name ?? 'Organisateur',
        eventTitle: eventData.title,
        eventUrl: `${appUrl}/events/${eventData.id}`,
        guestCount: count,
      })
      await sendEmail({ ...fullEmail, to: organizerData.user.email })
    }
  }

  return { reservation }
})
