import Joi from "joi"

import { BaseValidator } from "./base.validator"
import { IdValidator } from "./id.validator"
import { ProfilePhotoValidator } from "./profile-photo.validator"
import { Profile } from "../types/profile"
import { VCardValidator } from "./v-card.validator"
import { ProfileLinkValidator } from "./profile-link.validator"
import { ProfileTheme } from "../types/profile-theme"


export abstract class ProfileValidator extends BaseValidator {

	public static readValidationSchema: Joi.ObjectSchema<Profile> =
		Joi.object({
			id: IdValidator.readValidationSchema,
			name: Joi.string().max(20).optional().allow(null),
			surname: Joi.string().max(30).optional().allow(null),
			title: Joi.string().max(60).optional().allow(null),
			location: Joi.string().max(70).optional().allow(null),
			description: Joi.string().max(300).optional().allow(null),
			photo: ProfilePhotoValidator.readValidationSchema.optional().allow(null),
			vCard: VCardValidator.readValidationSchema.optional().allow(null),
			links: Joi.array().items(ProfileLinkValidator.readValidationSchema).unique((a, b) => a.id == b.id).optional().allow(null),
			theme: Joi.number().valid(...Object.values(ProfileTheme).filter(v => Number.isInteger(v))).optional().allow(null),
		})

	public static createOrUpdateValidationSchema: Joi.ObjectSchema<Profile> =
		Joi.object({
			id: IdValidator.createValidationSchema,
			name: Joi.string().max(20).required(),
			surname: Joi.string().max(30).optional().allow(null),
			title: Joi.string().max(60).optional().allow(null),
			location: Joi.string().max(70).optional().allow(null),
			description: Joi.string().max(300).optional().allow(null),
			photo: ProfilePhotoValidator.readValidationSchema.optional().allow(null),
			vCard: VCardValidator.readValidationSchema.optional().allow(null),
			links: Joi.array().items(ProfileLinkValidator.readValidationSchema).unique((a, b) => a.id == b.id).optional().allow(null),
			theme: Joi.number().valid(...Object.values(ProfileTheme).filter(v => Number.isInteger(v))).optional().allow(null),
		})

	public static isInvalidForRead(payload: any): boolean {
		return BaseValidator.isInvalidForSchema<Profile>(payload, ProfileValidator.readValidationSchema)
	}

	public static isInvalidForCreateOrUpdate(payload: any): boolean {
		return BaseValidator.isInvalidForSchema<Profile>(payload, ProfileValidator.createOrUpdateValidationSchema)
	}
}
