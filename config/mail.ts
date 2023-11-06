/**
 * Config source: https://git.io/JvgAf
 *
 * Feel free to let us know via PR, if you find something broken in this contract
 * file.
 */

import Env from '@ioc:Adonis/Core/Env'
import { mailConfig } from '@adonisjs/mail/build/config'

export default mailConfig({
  /*
  |--------------------------------------------------------------------------
  | Default mailer
  |--------------------------------------------------------------------------
  |
  | The following mailer will be used to send emails, when you don't specify
  | a mailer
  |
  */
  mailer: 'smtp',

  /*
  |--------------------------------------------------------------------------
  | Mailers
  |--------------------------------------------------------------------------
  |
  | You can define or more mailers to send emails from your application. A
  | single `driver` can be used to define multiple mailers with different
  | config.
  |
  | For example: Postmark driver can be used to have different mailers for
  | sending transactional and promotional emails
  |
  */
  mailers: {
    /*
    |--------------------------------------------------------------------------
    | Smtp
    |--------------------------------------------------------------------------
    |
    | Uses SMTP protocol for sending email
    |
    */
    smtp: {
      driver: 'smtp',
      pool: true,
      port: Env.get('SMTP_PORT', 465 ),
      host: Env.get('SMTP_HOST','smtp.mailgun.org'),
      secure: true,
      auth: {
        user: Env.get('MAIL_USERNAME','postmaster@sandboxd246d81c8a254657ad2947b909040b49.mailgun.org'),
        pass: Env.get('MAIL_PASSWORD','02afea54914c5dd3f6c8212264df89fb-3e508ae1-b038db22'),
        type:'login'
      },
      maxConnections: 5,
      maxMessages: 100,
      rateLimit: 10
    },
  },
})
