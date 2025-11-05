import { Resend } from 'resend'

const resend = new Resend("xxx")

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    const data = await resend.emails.send({
      from: 'alloé <noreply@mail.alloe.fr>',
      to,
      subject,
      html,
    })
    return data
  } catch (err) {
    console.error('Erreur lors de l\'envoi de l\'email :', err)
    throw err
  }
}
