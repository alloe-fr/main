export default defineEventHandler(async (event) => {
  return await sendMail({
    to: 'mathieu.nicolas@me.com',
    subject: 'Hello from Alloé',
    html: '<h1>Hello</h1><p>This is a test email.</p>',
  });
});