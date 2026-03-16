import { serverSupabaseUser } from '#supabase/server'
import {
  createServiceRoleClient,
  sendEmail,
  eventUpdatedEmail,
  formatEmailDate,
  formatEmailTime,
} from '~/server/utils'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }

  const eventId = event.context.params?.id
  const body = await readBody(event)
  const { title, description, date_time, max_seats } = body

  const serviceClient = createServiceRoleClient()

  // Verify event belongs to organizer
  const { data: existingEvent, error } = await serviceClient
    .from('events')
    .select('*')
    .eq('id', eventId)
    .eq('organizer_id', user.id)
    .single()

  if (error || !existingEvent) {
    throw createError({ statusCode: 404, statusMessage: 'Événement introuvable' })
  }

  const dateChanged = date_time && date_time !== existingEvent.date_time

  // Update event
  const { data: updatedEvent, error: updateError } = await serviceClient
    .from('events')
    .update({
      title: title ?? existingEvent.title,
      description: description ?? existingEvent.description,
      date_time: date_time ?? existingEvent.date_time,
      max_seats: max_seats ?? existingEvent.max_seats,
      updated_at: new Date().toISOString(),
    })
    .eq('id', eventId)
    .select()
    .single()

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message })
  }

  // If date changed, notify all confirmed guests
  if (dateChanged) {
    const config = useRuntimeConfig()
    const appUrl = config.public.appUrl

    const { data: guests } = await serviceClient
      .from('reservations')
      .select('user_id, profiles(full_name)')
      .eq('event_id', eventId)
      .eq('status', 'confirmed')

    if (guests) {
      for (const guest of guests) {
        const { data: userData } = await serviceClient.auth.admin.getUserById(guest.user_id)
        if (userData?.user?.email) {
          const profile = guest.profiles as { full_name: string | null } | null
          const updateEmail = eventUpdatedEmail({
            guestName: profile?.full_name || userData.user.email,
            eventTitle: updatedEvent.title,
            newDate: formatEmailDate(updatedEvent.date_time),
            newTime: formatEmailTime(updatedEvent.date_time),
            eventUrl: `${appUrl}/e/${updatedEvent.slug}`,
          })
          await sendEmail({ ...updateEmail, to: userData.user.email })
        }
      }
    }
  }

  return { event: updatedEvent }
})
