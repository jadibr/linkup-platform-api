import Joi from "joi"

import { BaseValidator } from "./base.validator"
import { IdValidator } from "./id.validator"
import { Card } from "../types/card"
import { ProfileValidator } from "./profile.validator"


export abstract class CardValidator extends BaseValidator {

	public static readValidationSchema: Joi.ObjectSchema<Card> =
		Joi.object({
			id: IdValidator.readValidationSchema,
			name: Joi.string().max(80).optional().allow(null),
			profile: ProfileValidator.readValidationSchema.optional().allow(null),
			isActive: Joi.boolean().optional().allow(null),
			isDisabled: Joi.boolean().optional().allow(null),
		})

	public static createOrUpdateValidationSchema: Joi.ObjectSchema<Card> =
		Joi.object({
			id: IdValidator.createValidationSchema,
			name: Joi.string().max(80).required(),
			profile: ProfileValidator.readValidationSchema.optional().allow(null),
			isActive: Joi.boolean().required(),
			isDisabled: Joi.boolean().optional().allow(null),
		})

	public static isInvalidForRead(payload: any): boolean {
		return BaseValidator.isInvalidForSchema<Card>(payload, CardValidator.readValidationSchema)
	}

	public static isInvalidForCreateOrUpdate(payload: any): boolean {
		return BaseValidator.isInvalidForSchema<Card>(payload, CardValidator.createOrUpdateValidationSchema)
	}
}
