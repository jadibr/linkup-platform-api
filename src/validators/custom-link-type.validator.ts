import Joi from "joi"

import { BaseValidator } from "./base.validator"
import { CustomLinkType } from "../types/custom-link-type"
import { IdValidator } from "./id.validator"


export abstract class CustomLinkTypeValidator extends BaseValidator {

	public static readValidationSchema: Joi.ObjectSchema<CustomLinkType> =
		Joi.object({
			id: IdValidator.readValidationSchema,
			name: Joi.string().max(20).optional().allow(null)
		})

	public static createOrUpdateValidationSchema: Joi.ObjectSchema<CustomLinkType> =
		Joi.object({
			id: IdValidator.createValidationSchema,
			name: Joi.string().max(20).required()
		})

	public static isInvalidForRead(payload: any): boolean {
		return BaseValidator.isInvalidForSchema<CustomLinkType>(payload, CustomLinkTypeValidator.readValidationSchema)
	}

	public static isInvalidForCreateOrUpdate(payload: any): boolean {
		return BaseValidator.isInvalidForSchema<CustomLinkType>(payload, CustomLinkTypeValidator.createOrUpdateValidationSchema)
	}
}
