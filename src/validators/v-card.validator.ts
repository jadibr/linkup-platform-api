import Joi from "joi"

import { BaseValidator } from "./base.validator"
import { IdValidator } from "./id.validator"
import { VCard } from "../types/vcard"


export abstract class VCardValidator extends BaseValidator {

	public static readValidationSchema: Joi.ObjectSchema<VCard> =
		Joi.object({
			id: IdValidator.readValidationSchema,
			name: Joi.string().max(20).optional().allow(null),
			surname: Joi.string().max(30).optional().allow(null),
			organization: Joi.string().max(60).optional().allow(null),
			workPhone: Joi.string().max(14).pattern(BaseValidator.phoneRegex).optional().allow(null),
			homePhone: Joi.string().max(14).pattern(BaseValidator.phoneRegex).optional().allow(null),
			email: Joi.string().min(6).max(50).pattern(BaseValidator.emailRegex).optional().allow(null),
			websiteUrl: Joi.string().max(200).optional().allow(null),
		})

	public static createOrUpdateValidationSchema: Joi.ObjectSchema<VCard> =
		Joi.object({
			id: IdValidator.createValidationSchema,
			name: Joi.string().max(20).required(),
			surname: Joi.string().max(30).optional().allow(null),
			organization: Joi.string().max(60).optional().allow(null),
			workPhone: Joi.string().max(14).pattern(BaseValidator.phoneRegex).optional().allow(null),
			homePhone: Joi.string().max(14).pattern(BaseValidator.phoneRegex).optional().allow(null),
			email: Joi.string().min(6).max(50).pattern(BaseValidator.emailRegex).optional().allow(null),
			websiteUrl: Joi.string().max(200).optional().allow(null),
		})
			.or('workPhone', 'homePhone', 'email', 'websiteUrl')

	public static isInvalidForRead(payload: any): boolean {
		return BaseValidator.isInvalidForSchema<VCard>(payload, VCardValidator.readValidationSchema)
	}

	public static isInvalidForCreateOrUpdate(payload: any): boolean {
		return BaseValidator.isInvalidForSchema<VCard>(payload, VCardValidator.createOrUpdateValidationSchema)
	}
}
