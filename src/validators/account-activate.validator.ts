import Joi from "joi"

import { BaseValidator } from "./base.validator"
import { IdValidator } from "./id.validator"


export abstract class AccountActivateValidator extends BaseValidator {

	public static readValidationSchema: Joi.ObjectSchema =
		Joi.object({
			accountId: IdValidator.readValidationSchema,
			activationTokenId: IdValidator.readValidationSchema,
		})

	public static isInvalidForRead(payload: any): boolean {
		return BaseValidator.isInvalidForSchema(payload, AccountActivateValidator.readValidationSchema)
	}
}