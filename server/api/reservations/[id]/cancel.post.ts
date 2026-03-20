import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import {
  createServiceRoleClient,
  sendEmail,
  reservationCancelledEmail,
  formatEmailDate,
} from '~/server/utils'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }

  const reservationId = event.context.params?.id
  if (!reservationId) {
    throw createError({ statusCode: 400, statusMessage: 'ID requis' })
  }

  const supabase = await serverSupabaseClient(event)
  const serviceClient = createServiceRoleClient()

  // Verify reservation belongs to user (user client passes RLS auth.uid() check)
  const { data: reservation, error } = await supabase
    .from('reservations')
    .select('*, event:events(title, date_time, organizer_id)')
    .eq('id', reservationId)
    .eq('user_id', user.id)
    .single()

  if (error || !reservation) {
    throw createError({ statusCode: 404, statusMessage: 'Réservation introuvable' })
  }

  if (reservation.status === 'cancelled') {
    throw createError({ statusCode: 409, statusMessage: 'Réservation déjà annulée' })
  }

  // Cancel reservation
  const { error: updateError } = await supabase
    .from('reservations')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', reservationId)

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message })
  }

  // Get profile for email
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const eventData = reservation.event as { title: string; date_time: string }
  const guestName = profile?.full_name || user.email || 'Invité'

  // Send cancellation email
  const cancelEmail = reservationCancelledEmail({
    guestName,
    eventTitle: eventData.title,
    eventDate: formatEmailDate(eventData.date_time),
  })
  await sendEmail({ ...cancelEmail, to: user.email! })

  return { success: true }
})
