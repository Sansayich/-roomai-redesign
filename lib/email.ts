export function emailTemplate({ url, host }: { url: string; host: string }) {
  const brandColor = "#6366f1"
  const buttonText = "#ffffff"
  const buttonBackground = brandColor

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Вход в roomGPT</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, ${brandColor} 0%, #8b5cf6 100%);">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff;">
                roomGPT
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #111827;">
                Вход в ваш аккаунт
              </h2>
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #6b7280;">
                Нажмите на кнопку ниже, чтобы войти в ваш аккаунт roomGPT и начать создавать потрясающие дизайны интерьера с помощью ИИ.
              </p>

              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${url}" target="_blank" style="display: inline-block; padding: 16px 40px; background-color: ${buttonBackground}; color: ${buttonText}; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Войти в аккаунт
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
                Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:
              </p>
              <p style="margin: 8px 0 0; font-size: 14px; word-break: break-all; color: #6366f1;">
                ${url}
              </p>

              <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">

              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
                Если вы не запрашивали это письмо, просто проигнорируйте его. Ссылка действительна в течение 24 часов.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                © ${new Date().getFullYear()} roomGPT. Все права защищены.
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #9ca3af;">
                ${host}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

export function textTemplate({ url, host }: { url: string; host: string }) {
  return `Вход в roomGPT

Нажмите на ссылку ниже, чтобы войти в ваш аккаунт:

${url}

Если вы не запрашивали это письмо, просто проигнорируйте его.

Ссылка действительна в течение 24 часов.

© ${new Date().getFullYear()} roomGPT
${host}
`
}

