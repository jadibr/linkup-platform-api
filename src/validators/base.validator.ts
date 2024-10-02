import Joi = require("joi")
import { Logger } from "../logger"

export abstract class BaseValidator {
	public static emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	public static passwordRegex = /^(?=.*[0-9]).+$/
	public static phoneRegex = /^\+?[0-9]+$/
	public static slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

	public static isInvalidForSchema<T>(payload: any, schema: Joi.ObjectSchema<T>): boolean {
		const { error } = schema.validate(payload)
		if (error != null) {
			Logger.logger.warn("Validation failed", error)
			return true
		}
		return false
	}
}