import Joi from "joi"
import { Router } from "express"

import { IdValidator } from "../validators/id.validator"
import { BaseValidator } from "../validators/base.validator"
import { ProfileService } from "../services/profile.service"
import { Profile } from "../types/profile"


export abstract class ProfilesRoutes {
	public static profilesPath = '/profiles'

	public static addProfilesRoutes(): Router {
		const router = Router()
		ProfilesRoutes.addRoutes(router)
		return router
	}

	public static mapProfile(profile: any, id: string | null = null): Profile {
		return new Profile(
			id ?? (profile as Profile).id ?? null,
			(profile as Profile).name == null ?
				undefined :
				(profile as Profile).name,
			(profile as Profile).surname == null ?
				undefined :
				(profile as Profile).surname,
			(profile as Profile).title == null ?
				undefined :
				(profile as Profile).title,
			(profile as Profile).location == null ?
				undefined :
				(profile as Profile).location,
			(profile as Profile).description == null ?
				undefined :
				(profile as Profile).description,
			(profile as Profile).photo == null ?
				undefined :
				(profile as Profile).photo,
			(profile as Profile).vCard == null ?
				undefined :
				(profile as Profile).vCard,
			(profile as Profile).links == null ?
				undefined :
				(profile as Profile).links,
			(profile as Profile).theme == null ?
				undefined :
				(profile as Profile).theme
		)
	}

	private static addRoutes(router: Router): void {

		router.get('/', async (req, res, next) => {

			const cardIdParam = req.query.cardId as string

			if (ProfilesRoutes.paramsForGetByCardAreInvalid(cardIdParam)) {
				res.status(400).send()
				return
			}

			try {
				res.json(await ProfileService.getForCard(cardIdParam))
			} catch (err) {
				next(err)
				return
			}
		})

		router.get('/:profileId', async (req, res, next) => {
			const profileIdParam = req.params.profileId as string

			if (IdValidator.isInvalidForRead(profileIdParam)) {
				res.status(400).send()
				return
			}

			try {
				res.json(await ProfileService.getById(profileIdParam))
			} catch (err) {
				next(err)
				return
			}

		})

	}

	private static paramsForGetByCardAreInvalid(cardId: string): boolean {
		const validationSchema = Joi.object({
			cardId: IdValidator.readValidationSchema
		})

		return BaseValidator.isInvalidForSchema({ cardId }, validationSchema)
	}

}