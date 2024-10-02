import nodemailer from "nodemailer"
import { Document } from "mongoose"

import { IAccount } from "../db-models/account.db-model"
import { Logger } from "../logger"


export abstract class EmailService {

	private static fromEmail = "escribeme.linkup@gmail.com"
	private static transporter = nodemailer.createTransport({
		service: "gmail",
		host: "smtp.gmail.com",
		port: 465,
		secure: true,
		auth: {
			user: process.env.MAIL_USER,
			pass: process.env.MAIL_PASS,
		}
	})

	public static async sendAccountVerification(accountDoc: IAccount): Promise<void> {

		if (accountDoc.name == null || accountDoc.email == null) {
			return
		}

		const mailOptions = EmailService.createMailOptions(
			accountDoc.name,
			accountDoc.email,
			"Verifica tu cuenta de LinkUp",
			`Bienvenido a LinkUp 👋\n\nPor favor haga clic en el enlace para activar su cuenta: https://app.linkup.direct/account-activation/${accountDoc.id}/${(accountDoc.activationToken as Document).id}\n\nSaludos,\n\nEquipo de LinkUp`
		)

		try {
			await EmailService.transporter.sendMail(mailOptions)
		} catch (err) {
			Logger.logger.error(`Failed to send email for account verification for account: ${accountDoc.id} (email: ${accountDoc.email})`, err)
			throw new Error(`Failed to send email for account verification for account: ${accountDoc.id} (email: ${accountDoc.email})`)
		}
	}

	public static async sendPasswordReset(accountDoc: IAccount): Promise<void> {

		if (accountDoc.name == null || accountDoc.email == null || accountDoc.passwordResetToken == null) {
			return
		}

		const mailOptions = EmailService.createMailOptions(
			accountDoc.name,
			accountDoc.email,
			"Restablecer la contraseña de su cuenta LinkUp",
			`Hola ${accountDoc.name}\n\nPor favor haga clic en el enlace para restablecer su contraseña: https://app.linkup.direct/password-reset/${accountDoc.id}/${(accountDoc.passwordResetToken as Document).id}\n\nSaludos,\n\nEquipo de LinkUp`
		)

		try {
			await EmailService.transporter.sendMail(mailOptions)
		} catch (err) {
			Logger.logger.error(`Failed to send email for new password-reset token request for account: ${accountDoc.id} (email: ${accountDoc.email})`, err)
			throw new Error(`Failed to send email for new password-reset token request for account: ${accountDoc.id} (email: ${accountDoc.email})`)
		}
	}

	public static async sendEmailUpdate(accountDoc: IAccount, newEmail: string): Promise<void> {

		if (accountDoc.name == null || accountDoc.email == null || newEmail == null || accountDoc.emailUpdateToken == null) {
			return
		}

		const mailOptions = EmailService.createMailOptions(
			accountDoc.name,
			newEmail,
			"Actualice el correo electrónico de su cuenta LinkUp",
			`Hola ${accountDoc.name}\n\nPor favor, haga clic en el enlace para verificar su nuevo correo electrónico: https://app.linkup.direct/email-update/${accountDoc.id}/${(accountDoc.emailUpdateToken as Document).id}\n\nSaludos,\n\nEquipo de LinkUp`
		)

		try {
			await EmailService.transporter.sendMail(mailOptions)
		} catch (err) {
			Logger.logger.error(`Failed to send email for email-update token request for account: ${accountDoc.id} (email: ${accountDoc.email})`, err)
			throw new Error(`Failed to send email for email-update token request for account: ${accountDoc.id} (email: ${accountDoc.email})`)
		}
	}

	private static createMailOptions(recipientName: string, recipientEmail: string, subject: string, text: string): nodemailer.SendMailOptions {
		return {
			from: {
				name: "LinkUp Team",
				address: EmailService.fromEmail
			},
			to: {
				name: recipientName,
				address: recipientEmail
			},
			subject: `${process.env.NODE_ENV === 'production' ? '' : '[TEST] '}${subject}`,
			text: text
		}
	}
}