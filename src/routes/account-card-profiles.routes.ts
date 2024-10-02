import { Router } from "express"

import { IdValidator } from "../validators/id.validator"
import { ProfileService } from "../services/profile.service"
import { ProfileValidator } from "../validators/profile.validator"
import { ProfilesRoutes } from "./profiles.routes"
import { AccountCardsRoutes } from "./account-cards.routes"


export abstract class AccountCardProfilesRoutes {
	public static accountCardProfilesPath = `${AccountCardsRoutes.accountCardsPath}/:cardId/profiles`

	public static addAccountCardProfilesRoutes(): Router {
		const router = Router({ mergeParams: true })
		AccountCardProfilesRoutes.addRoutes(router)
		return router
	}

	private static addRoutes(router: Router): void {

		router.post('/', async (req, res, next) => {

			const accountIdParam = (req.params as any).accountId as string
			const cardIdParam = (req.params as any).cardId as string

			if (IdValidator.isInvalidForRead(accountIdParam) || 
					IdValidator.isInvalidForRead(cardIdParam) ||
					ProfileValidator.isInvalidForCreateOrUpdate(req.body)) {
				res.status(400).send()
				return
			}

			if (accountIdParam != res.locals.accountId) {
				res.status(403).send()
				return
			}

			try {
				res.json(await ProfileService.createForCardForAccount(
					accountIdParam,
					cardIdParam,
					ProfilesRoutes.mapProfile(req.body)))
			} catch (err) {
				next(err)
				return
			}
		})

		router.put('/:profileId', async (req, res, next) => {

			const accountIdParam = (req.params as any).accountId as string
			const cardIdParam = (req.params as any).cardId as string
			const profileIdParam = req.params.profileId

			if (IdValidator.isInvalidForRead(accountIdParam) ||
					IdValidator.isInvalidForRead(cardIdParam) ||
					IdValidator.isInvalidForRead(profileIdParam) ||
					ProfileValidator.isInvalidForCreateOrUpdate(req.body)) {
				res.status(400).send()
				return
			}

			if (accountIdParam != res.locals.accountId) {
				res.status(403).send()
				return
			}

			try {
				res.json(await ProfileService.updateForAccountForCard(accountIdParam, cardIdParam, ProfilesRoutes.mapProfile(req.body, profileIdParam)))
			} catch (err) {
				next(err)
				return
			}
		})

		router.delete('/:profileId', async (req, res, next) => {
			const accountIdParam = (req.params as any).accountId as string
			const cardIdParam = (req.params as any).cardId as string
			const profileIdParam = req.params.profileId

			if (IdValidator.isInvalidForRead(accountIdParam) ||
					IdValidator.isInvalidForRead(cardIdParam) ||
					IdValidator.isInvalidForRead(profileIdParam)) {
				res.status(400).send()
				return
			}

			if (accountIdParam != res.locals.accountId) {
				res.status(403).send()
				return
			}

			try {
				res.json(await ProfileService.deleteForAccountForCard(accountIdParam, cardIdParam, profileIdParam))
			} catch (err) {
				next(err)
				return
			}
		})

	}


}