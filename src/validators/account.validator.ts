import Joi from "joi"

import { BaseValidator } from "./base.validator"
import { IdValidator } from "./id.validator"
import { Account } from "../types/account"
import { CardValidator } from "./card.validator"
import { ProfileValidator } from "./profile.validator"
import { CustomLinkTypeValidator } from "./custom-link-type.validator"


export abstract class AccountValidator extends BaseValidator {

	public static readValidationSchema: Joi.ObjectSchema<Account> =
		Joi.object({
			id: IdValidator.readValidationSchema,
			name: Joi.string().max(60).optional().allow(null),
			contactName: Joi.string().max(50).optional().allow(null),
			phone: Joi.string().max(14).pattern(BaseValidator.phoneRegex).optional().allow(null),
			email: Joi.string().min(6).max(50).pattern(BaseValidator.emailRegex).optional().allow(null),
			password: Joi.string().min(6).max(30).pattern(BaseValidator.passwordRegex).optional().allow(null),
			isActive: Joi.boolean().optional().allow(null),
			isDisabled: Joi.boolean().optional().allow(null),
			profile: ProfileValidator.readValidationSchema.optional().allow(null),
			cards: Joi.array().items(CardValidator.readValidationSchema).unique((a, b) => a.id == b.id).optional().allow(null),
			customProfileLinkTypes: Joi.array().items(CustomLinkTypeValidator.readValidationSchema).unique((a, b) => a.id == b.id).optional().allow(null),
		})

	public static createValidationSchema: Joi.ObjectSchema<Account> =
		Joi.object({
			id: IdValidator.createValidationSchema,
			name: Joi.string().max(60).required(),
			contactName: Joi.string().max(50).required(),
			phone: Joi.string().max(14).pattern(BaseValidator.phoneRegex).required(),
			email: Joi.string().min(6).max(50).pattern(BaseValidator.emailRegex).required(),
			password: Joi.string().min(6).max(30).pattern(BaseValidator.passwordRegex).required(),
			isActive: Joi.boolean().optional().allow(null),
			isDisabled: Joi.boolean().optional().allow(null),
			profile: Joi.allow(null),
			cards: Joi.allow(null),
			customProfileLinkTypes: Joi.allow(null),
		})

	public static updateValidationSchema: Joi.ObjectSchema<Account> =
		Joi.object({
			id: IdValidator.createValidationSchema,
			name: Joi.string().max(60).required(),
			contactName: Joi.string().max(50).required(),
			phone: Joi.string().max(14).pattern(BaseValidator.phoneRegex).required(),
			email: Joi.string().min(6).max(50).pattern(BaseValidator.emailRegex).optional().allow(null),
			password: Joi.string().min(6).max(30).pattern(BaseValidator.passwordRegex).optional().allow(null),
			isActive: Joi.boolean().required(),
			isDisabled: Joi.boolean().optional().allow(null),
			profile: ProfileValidator.readValidationSchema.optional().allow(null),
			cards: Joi.array().items(CardValidator.readValidationSchema).unique((a, b) => a.id == b.id).optional().allow(null),
			customProfileLinkTypes: Joi.array().items(CustomLinkTypeValidator.readValidationSchema).unique((a, b) => a.id == b.id).optional().allow(null),
		})

	public static isInvalidForRead(payload: any): boolean {
		return BaseValidator.isInvalidForSchema<Account>(payload, AccountValidator.readValidationSchema)
	}

	public static isInvalidForCreate(payload: any): boolean {
		return BaseValidator.isInvalidForSchema<Account>(payload, AccountValidator.createValidationSchema)
	}

	public static isInvalidForUpdate(payload: any): boolean {
		return BaseValidator.isInvalidForSchema<Account>(payload, AccountValidator.updateValidationSchema)
	}
}
