import Joi from 'joi'

import { BaseValidator } from "./base.validator"
import { IdValidator } from './id.validator'


export abstract class EmailUpdateValidator {

	private static emailUpdateTokenRequestValidationSchema: Joi.ObjectSchema = 
		Joi.object({
			accountId: IdValidator.readValidationSchema,
			email: Joi.string().min(6).max(50).pattern(BaseValidator.emailRegex).required(),
		})

	private static emailUpdateValidationSchema: Joi.ObjectSchema =
		Joi.object({
			accountId: IdValidator.readValidationSchema,
			updateTokenId: IdValidator.readValidationSchema,
		})

	public static isInvalidForEmailUpdateTokenRequest(payload: any): boolean {
		return BaseValidator.isInvalidForSchema(payload, EmailUpdateValidator.emailUpdateTokenRequestValidationSchema)
	}

	public static isInvalidForEmailUpdate(payload: any): boolean {
		return BaseValidator.isInvalidForSchema(payload, EmailUpdateValidator.emailUpdateValidationSchema)
	}
}