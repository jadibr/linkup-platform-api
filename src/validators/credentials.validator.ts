import Joi from 'joi'

import { Credentials } from "../types/credentials"
import { BaseValidator } from "./base.validator"

export abstract class CredentialsValidator {

	private static readValidationSchema: Joi.ObjectSchema<Credentials> = 
		Joi.object({
			email: Joi.string().min(6).max(50).pattern(BaseValidator.emailRegex).required(),
			password: Joi.string().min(6).max(30).pattern(BaseValidator.passwordRegex).required(),
		})

	public static isInvalid(payload: any): boolean {
		return BaseValidator.isInvalidForSchema(payload, CredentialsValidator.readValidationSchema)
	}
}

