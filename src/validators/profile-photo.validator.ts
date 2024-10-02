import Joi from "joi"

import { BaseValidator } from "./base.validator"
import { IdValidator } from "./id.validator"
import { ProfilePhoto } from "../types/profile-photo"


export abstract class ProfilePhotoValidator extends BaseValidator {

	public static readValidationSchema: Joi.ObjectSchema<ProfilePhoto> =
		Joi.object({
			id: IdValidator.readValidationSchema,
			fileName: IdValidator.createValidationSchema
		})

	public static createOrUpdateValidationSchema: Joi.ObjectSchema<ProfilePhoto> =
		Joi.object({
			id: IdValidator.createValidationSchema,
			fileName: IdValidator.readValidationSchema
		})

	public static isInvalidForRead(payload: any): boolean {
		return BaseValidator.isInvalidForSchema<ProfilePhoto>(payload, ProfilePhotoValidator.readValidationSchema)
	}

	public static isInvalidForCreateOrUpdate(payload: any): boolean {
		return BaseValidator.isInvalidForSchema<ProfilePhoto>(payload, ProfilePhotoValidator.createOrUpdateValidationSchema)
	}
}
