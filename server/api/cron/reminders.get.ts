import {
  createServiceRoleClient,
  sendEmail,
  eventReminderEmail,
  formatEmailDate,
  formatEmailTime,
} from '~/server/utils'

export default defineEventHandler(async (event) => {
  // Protect cron endpoint
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')
  const cronSecret = config.cronSecret

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const serviceClient = createServiceRoleClient()

  // Find events happening tomorrow (between tomorrow 00:00 and 23:59)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStart = new Date(tomorrow)
  tomorrowStart.setHours(0, 0, 0, 0)
  const tomorrowEnd = new Date(tomorrow)
  tomorrowEnd.setHours(23, 59, 59, 999)

  const { data: events } = await serviceClient
    .from('events')
    .select('*')
    .in('status', ['active', 'full'])
    .gte('date_time', tomorrowStart.toISOString())
    .lte('date_time', tomorrowEnd.toISOString())

  if (!events || events.length === 0) {
    return { sent: 0, message: 'No events tomorrow' }
  }

  const appUrl = config.public.appUrl
  let totalSent = 0

  for (const eventData of events) {
    // Get confirmed guests
    const { data: guests } = await serviceClient
      .from('reservations')
      .select('user_id, profiles(full_name)')
      .eq('event_id', eventData.id)
      .eq('status', 'confirmed')

    if (!guests) continue

    // Get organizer name
    const { data: organizer } = await serviceClient
      .from('profiles')
      .select('full_name')
      .eq('id', eventData.organizer_id)
      .single()

    for (const guest of guests) {
      const { data: userData } = await serviceClient.auth.admin.getUserById(guest.user_id)
      if (!userData?.user?.email) continue

      const profile = guest.profiles as { full_name: string | null } | null
      const reminderEmail = eventReminderEmail({
        guestName: profile?.full_name || userData.user.email,
        eventTitle: eventData.title,
        eventDate: formatEmailDate(eventData.date_time),
        eventTime: formatEmailTime(eventData.date_time),
        organizerName: organizer?.full_name ?? 'L\'organisateur',
        eventUrl: `${appUrl}/e/${eventData.slug}`,
      })

      const sent = await sendEmail({ ...reminderEmail, to: userData.user.email })
      if (sent) totalSent++
    }
  }

  return {
    sent: totalSent,
    events: events.length,
    message: `Sent ${totalSent} reminder emails for ${events.length} events`,
  }
})
