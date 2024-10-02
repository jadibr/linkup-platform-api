import Joi from "joi"

import { BaseValidator } from "./base.validator"
import { IdValidator } from "./id.validator"
import { ProfileLink } from "../types/profile-link"
import { ProfileLinkType } from "../types/enums/profile-link-type"
import { CustomLinkTypeValidator } from "./custom-link-type.validator"


export abstract class ProfileLinkValidator extends BaseValidator {

	public static readValidationSchema: Joi.ObjectSchema<ProfileLink> =
		Joi.object({
			id: IdValidator.readValidationSchema,
			linkType: Joi.number().valid(...Object.values(ProfileLinkType).filter(v => Number.isInteger(v)))
				.optional().allow(null),
			name: Joi.string().max(20).optional().allow(null),
			value: Joi.string().max(200).optional().allow(null),
			orderNumber: Joi.number().integer().min(1).optional().allow(null),
			customLinkType: CustomLinkTypeValidator.readValidationSchema.optional().allow(null)
		})

	public static createOrUpdateValidationSchema: Joi.ObjectSchema<ProfileLink> =
		Joi.object({
			id: IdValidator.createValidationSchema,
			linkType: Joi.number().valid(...Object.values(ProfileLinkType).filter(v => Number.isInteger(v)))
				.required(),
			name: Joi.string().max(20).optional().allow(null),
			value: Joi.string().max(200).required(),
			orderNumber: Joi.number().integer().min(1).required(),
			customLinkType: CustomLinkTypeValidator.readValidationSchema
				.when('linkType', {
					is: Joi.number().valid(ProfileLinkType.Custom).required(),
					then: Joi.required(),
					otherwise: Joi.optional().allow(null)
				})
		})

	public static isInvalidForRead(payload: any): boolean {
		return BaseValidator.isInvalidForSchema<ProfileLink>(payload, ProfileLinkValidator.readValidationSchema)
	}

	public static isInvalidForCreateOrUpdate(payload: any): boolean {
		return BaseValidator.isInvalidForSchema<ProfileLink>(payload, ProfileLinkValidator.createOrUpdateValidationSchema)
	}
}
