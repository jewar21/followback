const admin = require('firebase-admin')
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore')
const { defineSecret, defineString } = require('firebase-functions/params')
const { Resend } = require('resend')

admin.initializeApp()

const firestore = admin.firestore()
const resendApiKey = defineSecret('RESEND_API_KEY')
const mailFrom = defineString('MAIL_FROM')
const appBaseUrl = defineString('APP_BASE_URL')
const emailAutomationEnabled = defineString('EMAIL_AUTOMATION_ENABLED')
const adminCampaignsEnabled = defineString('ADMIN_CAMPAIGNS_ENABLED')
const functionRegion = 'us-central1'

function chunk(items, size) {
  const chunks = []

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }

  return chunks
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function formatBodyAsHtml(body) {
  return body
    .split('\n')
    .map((line) => line.trim())
    .map((line) => (line ? `<p>${escapeHtml(line)}</p>` : '<div style="height:12px"></div>'))
    .join('')
}

function buildEmailShell({ title, intro, bodyHtml, ctaLabel, ctaUrl }) {
  return `
    <div style="font-family:Arial,sans-serif;background:#05111f;padding:24px;color:#eef6ff">
      <div style="max-width:640px;margin:0 auto;background:#0b182a;border:1px solid rgba(140,198,255,0.14);border-radius:24px;padding:32px">
        <p style="margin:0 0 12px;color:#5be4b7;font-size:12px;letter-spacing:0.12em;text-transform:uppercase">FollowBack</p>
        <h1 style="margin:0 0 16px;font-size:30px;line-height:1.05">${escapeHtml(title)}</h1>
        <p style="margin:0 0 20px;color:#99abc5;font-size:16px;line-height:1.6">${escapeHtml(intro)}</p>
        <div style="color:#eef6ff;font-size:15px;line-height:1.7">${bodyHtml}</div>
        <div style="margin-top:28px">
          <a href="${ctaUrl}" style="display:inline-block;background:#00c897;color:#062014;padding:14px 22px;border-radius:999px;font-weight:700;text-decoration:none">${escapeHtml(ctaLabel)}</a>
        </div>
      </div>
    </div>
  `
}

function getResendClient() {
  return new Resend(resendApiKey.value())
}

function isEnabled(param) {
  return String(param.value() || '').toLowerCase() === 'true'
}

async function getAdminUser(uid) {
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Debes iniciar sesion.')
  }

  const snapshot = await firestore.collection('users').doc(uid).get()
  const user = snapshot.data()

  if (!snapshot.exists || !user || user.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Solo un admin puede ejecutar esta accion.')
  }

  return user
}

async function resolveRecipients(audience) {
  const [usersSnapshot, venturesSnapshot] = await Promise.all([
    firestore.collection('users').get(),
    firestore.collection('ventures').get(),
  ])

  const users = usersSnapshot.docs.map((snapshot) => snapshot.data())
  const venturesByOwnerId = new Set(
    venturesSnapshot.docs
      .map((snapshot) => snapshot.data())
      .map((venture) => venture.ownerId),
  )

  return users.filter((user) => {
    if (!user.email || user.status !== 'active') {
      return false
    }

    if (audience === 'all_active') {
      return true
    }

    if (audience === 'completed_onboarding') {
      return user.onboardingCompleted === true
    }

    if (audience === 'without_venture') {
      return !venturesByOwnerId.has(user.uid)
    }

    return user.onboardingCompleted !== true
  })
}

exports.sendAdminCampaignEmails = onCall(
  { region: functionRegion, secrets: [resendApiKey] },
  async (request) => {
    await getAdminUser(request.auth?.uid)

    if (!isEnabled(adminCampaignsEnabled)) {
      throw new HttpsError('failed-precondition', 'Las campanas de correo estan desactivadas en este entorno.')
    }

    const subject = String(request.data?.subject ?? '').trim()
    const body = String(request.data?.body ?? '').trim()
    const audience = String(request.data?.audience ?? '').trim()

    if (!subject || !body) {
      throw new HttpsError('invalid-argument', 'El asunto y el mensaje son obligatorios.')
    }

    if (!['all_active', 'pending_onboarding', 'completed_onboarding', 'without_venture'].includes(audience)) {
      throw new HttpsError('invalid-argument', 'La audiencia no es valida.')
    }

    const recipients = await resolveRecipients(audience)

    if (recipients.length === 0) {
      throw new HttpsError('failed-precondition', 'No hay destinatarios para esa audiencia.')
    }

    const resend = getResendClient()
    const campaignId = firestore.collection('emailCampaigns').doc().id
    const ctaUrl = `${appBaseUrl.value().replace(/\/$/, '')}/feedback`
    const htmlBody = buildEmailShell({
      title: subject,
      intro: 'Te escribimos desde FollowBack para compartir actualizaciones y pedirte apoyo con tu perfil y feedback.',
      bodyHtml: formatBodyAsHtml(body),
      ctaLabel: 'Abrir FollowBack',
      ctaUrl,
    })

    const payload = recipients.map((recipient) => ({
      from: mailFrom.value(),
      to: [recipient.email],
      subject,
      html: htmlBody,
      text: body,
    }))

    for (const batch of chunk(payload, 100)) {
      const { error } = await resend.batch.send(batch)

      if (error) {
        throw new HttpsError('internal', `No fue posible enviar la campana: ${error.message}`)
      }
    }

    await firestore.collection('emailCampaigns').doc(campaignId).set({
      id: campaignId,
      createdBy: request.auth.uid,
      audience,
      subject,
      body,
      recipientCount: recipients.length,
      createdAt: new Date().toISOString(),
      status: 'sent',
    })

    return {
      campaignId,
      recipientCount: recipients.length,
    }
  },
)

exports.sendWelcomeEmailOnUserCreated = onDocumentCreated(
  { region: functionRegion, document: 'users/{userId}', secrets: [resendApiKey] },
  async (event) => {
    if (!isEnabled(emailAutomationEnabled)) {
      return
    }

    const snapshot = event.data
    if (!snapshot) {
      return
    }

    const user = snapshot.data()
    if (!user?.email || user.welcomeEmailSentAt) {
      return
    }

    const resend = getResendClient()
    const ctaUrl = `${appBaseUrl.value().replace(/\/$/, '')}/onboarding`
    const html = buildEmailShell({
      title: 'Bienvenido a FollowBack',
      intro: 'Tu cuenta ya fue creada. El siguiente paso es completar tu perfil para que tu emprendimiento pueda quedar visible.',
      bodyHtml: formatBodyAsHtml(
        [
          'Gracias por registrarte en FollowBack.',
          'Completa tu onboarding para agregar los datos principales de tu emprendimiento y empezar a aparecer en el directorio.',
          'Si algo del proceso te resulta confuso, tambien puedes dejarnos tu feedback dentro de la app.',
        ].join('\n'),
      ),
      ctaLabel: 'Completar onboarding',
      ctaUrl,
    })

    const { error } = await resend.emails.send({
      from: mailFrom.value(),
      to: [user.email],
      subject: 'Bienvenido a FollowBack',
      html,
      text: 'Bienvenido a FollowBack. Completa tu onboarding para publicar tu emprendimiento y dejarnos feedback si algo te bloquea.',
    })

    if (error) {
      throw new Error(`No fue posible enviar el correo de bienvenida: ${error.message}`)
    }

    await snapshot.ref.set(
      {
        welcomeEmailSentAt: new Date().toISOString(),
      },
      { merge: true },
    )
  },
)

exports.sendOnboardingCompletionEmail = onDocumentUpdated(
  { region: functionRegion, document: 'users/{userId}', secrets: [resendApiKey] },
  async (event) => {
    if (!isEnabled(emailAutomationEnabled)) {
      return
    }

    const before = event.data?.before.data()
    const after = event.data?.after.data()

    if (!before || !after?.email) {
      return
    }

    if (before.onboardingCompleted || !after.onboardingCompleted || after.onboardingEmailSentAt) {
      return
    }

    const resend = getResendClient()
    const ctaUrl = `${appBaseUrl.value().replace(/\/$/, '')}/dashboard`
    const html = buildEmailShell({
      title: 'Tu perfil ya quedo publicado',
      intro: 'Tu onboarding en FollowBack fue completado. Ahora puedes seguir ajustando tu perfil y ayudarnos con feedback temprano.',
      bodyHtml: formatBodyAsHtml(
        [
          'Tu emprendimiento ya esta mas cerca de quedar disponible con datos utiles para la comunidad.',
          'Te recomendamos revisar tu dashboard, completar cualquier detalle adicional y contarnos si hay algo que debamos mejorar en la experiencia.',
        ].join('\n'),
      ),
      ctaLabel: 'Ir al dashboard',
      ctaUrl,
    })

    const { error } = await resend.emails.send({
      from: mailFrom.value(),
      to: [after.email],
      subject: 'Tu perfil en FollowBack ya esta publicado',
      html,
      text: 'Tu onboarding fue completado. Entra a tu dashboard para revisar tu perfil y compartir feedback sobre la experiencia.',
    })

    if (error) {
      throw new Error(`No fue posible enviar el correo de onboarding: ${error.message}`)
    }

    await event.data.after.ref.set(
      {
        onboardingEmailSentAt: new Date().toISOString(),
      },
      { merge: true },
    )
  },
)
