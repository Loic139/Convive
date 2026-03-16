import { Resend } from 'resend'

export function createResendClient() {
  const config = useRuntimeConfig()
  const apiKey = config.resendApiKey || process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set — emails disabled')
    return null
  }

  return new Resend(apiKey)
}

function getFromAddress() {
  const config = useRuntimeConfig()
  const name = config.resendFromName || 'Convive'
  const email = config.resendFromEmail || 'noreply@convive.app'
  return `${name} <${email}>`
}

function getAppUrl() {
  const config = useRuntimeConfig()
  return config.public.appUrl || 'https://convive.app'
}

export interface EmailData {
  to: string
  subject: string
  html: string
}

export async function sendEmail(data: EmailData): Promise<boolean> {
  const resend = createResendClient()
  if (!resend) return false

  try {
    const { error } = await resend.emails.send({
      from: getFromAddress(),
      to: data.to,
      subject: data.subject,
      html: data.html,
    })
    if (error) {
      console.error('[email] Send error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('[email] Exception:', err)
    return false
  }
}

// ─── Email templates ───────────────────────────────────────────────────────

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F5F0E8; color: #1a1a1a; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 32px 16px; }
    .header { text-align: center; margin-bottom: 24px; }
    .logo { font-size: 24px; font-weight: 700; color: #C4714A; }
    .card { background: #fff; border-radius: 16px; padding: 32px; margin-bottom: 16px; }
    .title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px; }
    .meta { color: #666; font-size: 14px; margin-bottom: 4px; }
    .highlight { background: #F5F0E8; border-radius: 12px; padding: 16px; margin: 20px 0; }
    .highlight p { margin-bottom: 6px; font-size: 15px; }
    .label { color: #888; font-size: 13px; }
    .btn { display: inline-block; background: #C4714A; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px; margin: 20px 0; }
    .footer { text-align: center; color: #aaa; font-size: 12px; margin-top: 24px; }
    .divider { border: none; border-top: 1px solid #EAE3D2; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <span class="logo">🍽 Convive</span>
    </div>
    ${content}
    <div class="footer">
      <p>Convive — Organisez vos repas entre amis</p>
    </div>
  </div>
</body>
</html>`
}

export function reservationConfirmedEmail(params: {
  guestName: string
  eventTitle: string
  eventDate: string
  eventTime: string
  organizerName: string
  eventUrl: string
}): EmailData {
  const subject = `Ta place est réservée — ${params.eventTitle}`
  const html = baseTemplate(`
    <div class="card">
      <p class="title">Ta place est réservée ! 🎉</p>
      <p class="meta">Salut ${params.guestName},</p>
      <p class="meta" style="margin-top: 8px;">Tu es inscrit au repas suivant :</p>
      <div class="highlight">
        <p><strong>${params.eventTitle}</strong></p>
        <p class="label">Organisé par ${params.organizerName}</p>
        <hr class="divider">
        <p>📅 <strong>${params.eventDate}</strong></p>
        <p>🕐 <strong>${params.eventTime}</strong></p>
      </div>
      <a href="${params.eventUrl}" class="btn">Voir le repas</a>
      <hr class="divider">
      <p style="font-size: 13px; color: #888;">Tu recevras un rappel 24h avant le repas.</p>
    </div>
  `)
  return { to: '', subject, html }
}

export function reservationCancelledEmail(params: {
  guestName: string
  eventTitle: string
  eventDate: string
}): EmailData {
  const subject = `Réservation annulée — ${params.eventTitle}`
  const html = baseTemplate(`
    <div class="card">
      <p class="title">Réservation annulée</p>
      <p class="meta">Salut ${params.guestName},</p>
      <p class="meta" style="margin-top: 8px;">Ta réservation pour le repas suivant a été annulée :</p>
      <div class="highlight">
        <p><strong>${params.eventTitle}</strong></p>
        <p>📅 ${params.eventDate}</p>
      </div>
      <p style="font-size: 14px; color: #666;">Ta place a été libérée pour quelqu'un d'autre.</p>
    </div>
  `)
  return { to: '', subject, html }
}

export function eventCancelledEmail(params: {
  guestName: string
  eventTitle: string
  eventDate: string
  organizerName: string
  reason?: string
}): EmailData {
  const subject = `Repas annulé — ${params.eventTitle}`
  const html = baseTemplate(`
    <div class="card">
      <p class="title">Repas annulé 😔</p>
      <p class="meta">Salut ${params.guestName},</p>
      <p class="meta" style="margin-top: 8px;">${params.organizerName} a annulé le repas suivant :</p>
      <div class="highlight">
        <p><strong>${params.eventTitle}</strong></p>
        <p>📅 ${params.eventDate}</p>
        ${params.reason ? `<hr class="divider"><p style="font-size: 14px; color: #666;">Motif : ${params.reason}</p>` : ''}
      </div>
      <p style="font-size: 14px; color: #666;">Ton inscription a bien été annulée. À bientôt !</p>
    </div>
  `)
  return { to: '', subject, html }
}

export function eventReminderEmail(params: {
  guestName: string
  eventTitle: string
  eventDate: string
  eventTime: string
  organizerName: string
  eventUrl: string
}): EmailData {
  const subject = `C'est demain ! — ${params.eventTitle}`
  const html = baseTemplate(`
    <div class="card">
      <p class="title">À demain ! 🍽</p>
      <p class="meta">Salut ${params.guestName},</p>
      <p class="meta" style="margin-top: 8px;">Rappel : tu es inscrit au repas de demain !</p>
      <div class="highlight">
        <p><strong>${params.eventTitle}</strong></p>
        <p class="label">Organisé par ${params.organizerName}</p>
        <hr class="divider">
        <p>📅 <strong>${params.eventDate}</strong></p>
        <p>🕐 <strong>${params.eventTime}</strong></p>
      </div>
      <a href="${params.eventUrl}" class="btn">Voir le repas</a>
    </div>
  `)
  return { to: '', subject, html }
}

export function eventUpdatedEmail(params: {
  guestName: string
  eventTitle: string
  newDate: string
  newTime: string
  eventUrl: string
}): EmailData {
  const subject = `Repas modifié — ${params.eventTitle}`
  const html = baseTemplate(`
    <div class="card">
      <p class="title">Repas modifié ℹ️</p>
      <p class="meta">Salut ${params.guestName},</p>
      <p class="meta" style="margin-top: 8px;">Les informations du repas ont été mises à jour :</p>
      <div class="highlight">
        <p><strong>${params.eventTitle}</strong></p>
        <hr class="divider">
        <p>📅 Nouvelle date : <strong>${params.newDate}</strong></p>
        <p>🕐 Nouvelle heure : <strong>${params.newTime}</strong></p>
      </div>
      <a href="${params.eventUrl}" class="btn">Voir le repas</a>
    </div>
  `)
  return { to: '', subject, html }
}

export function eventFullEmail(params: {
  organizerName: string
  eventTitle: string
  eventUrl: string
  guestCount: number
}): EmailData {
  const subject = `Ton repas est complet — ${params.eventTitle}`
  const html = baseTemplate(`
    <div class="card">
      <p class="title">Ton repas est complet ! 🎉</p>
      <p class="meta">Bravo ${params.organizerName} !</p>
      <p class="meta" style="margin-top: 8px;">Toutes les places pour <strong>${params.eventTitle}</strong> ont été réservées.</p>
      <div class="highlight">
        <p>👥 <strong>${params.guestCount} invités</strong> ont réservé leur place.</p>
      </div>
      <a href="${params.eventUrl}" class="btn">Voir la liste des invités</a>
    </div>
  `)
  return { to: '', subject, html }
}

// Helper to format date for emails
export function formatEmailDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function formatEmailTime(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}
