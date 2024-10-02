import Joi from 'joi'

import { BaseValidator } from "./base.validator"
import { IdValidator } from './id.validator'


export abstract class PasswordResetValidator {

	private static passwordResetTokenRequestValidationSchema: Joi.ObjectSchema = 
		Joi.object({
			email: Joi.string().min(6).max(50).pattern(BaseValidator.emailRegex).required(),
		})

	private static newPasswordValidationSchema: Joi.ObjectSchema =
		Joi.object({
			accountId: IdValidator.readValidationSchema,
			resetTokenId: IdValidator.readValidationSchema,
			password: Joi.string().min(6).max(30).pattern(BaseValidator.passwordRegex).required(),
		})

	public static isInvalidForPasswordResetTokenRequest(payload: any): boolean {
		return BaseValidator.isInvalidForSchema(payload, PasswordResetValidator.passwordResetTokenRequestValidationSchema)
	}

	public static isInvalidForNewPassword(payload: any): boolean {
		return BaseValidator.isInvalidForSchema(payload, PasswordResetValidator.newPasswordValidationSchema)
	}
}

