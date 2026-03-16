import { serverSupabaseUser } from '#supabase/server'
import {
  createServiceRoleClient,
  sendEmail,
  eventCancelledEmail,
  formatEmailDate,
} from '~/server/utils'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }

  const eventId = event.context.params?.id
  const { reason } = await readBody(event)

  const serviceClient = createServiceRoleClient()

  // Verify event belongs to organizer
  const { data: eventData, error } = await serviceClient
    .from('events')
    .select('*, organizer:profiles(full_name)')
    .eq('id', eventId)
    .eq('organizer_id', user.id)
    .single()

  if (error || !eventData) {
    throw createError({ statusCode: 404, statusMessage: 'Événement introuvable' })
  }

  if (eventData.status === 'cancelled') {
    throw createError({ statusCode: 409, statusMessage: 'Déjà annulé' })
  }

  // Cancel event + all confirmed reservations
  const { error: cancelError } = await serviceClient
    .from('events')
    .update({ status: 'cancelled', cancel_reason: reason || null, updated_at: new Date().toISOString() })
    .eq('id', eventId)

  if (cancelError) {
    throw createError({ statusCode: 500, statusMessage: cancelError.message })
  }

  await serviceClient
    .from('reservations')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('event_id', eventId)
    .eq('status', 'confirmed')

  // Get all confirmed guests to notify
  const { data: guests } = await serviceClient
    .from('reservations')
    .select('user_id, profiles(full_name)')
    .eq('event_id', eventId)

  if (guests && guests.length > 0) {
    // Get guest emails
    for (const guest of guests) {
      const { data: userData } = await serviceClient.auth.admin.getUserById(guest.user_id)
      if (userData?.user?.email) {
        const profile = guest.profiles as { full_name: string | null } | null
        const cancelEmail = eventCancelledEmail({
          guestName: profile?.full_name || userData.user.email,
          eventTitle: eventData.title,
          eventDate: formatEmailDate(eventData.date_time),
          organizerName: (eventData.organizer as { full_name: string | null })?.full_name ?? 'L\'organisateur',
          reason: reason || undefined,
        })
        await sendEmail({ ...cancelEmail, to: userData.user.email })
      }
    }
  }

  return { success: true }
})
