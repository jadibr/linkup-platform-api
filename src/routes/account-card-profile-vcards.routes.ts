import { Router } from "express"

import { IdValidator } from "../validators/id.validator"
import { AccountCardProfilesRoutes } from "./account-card-profiles.routes"
import { VCardService } from "../services/v-card.service"
import { VCardValidator } from "../validators/v-card.validator"
import { AccountProfileVCardsRoutes } from "./account-profile-vcards.routes"


export abstract class AccountCardProfileVCardsRoutes {
	public static accountCardProfileVCardsPath = `${AccountCardProfilesRoutes.accountCardProfilesPath}/:profileId/v-cards`

	public static addAccountCardProfileVCardsRoutes(): Router {
		const router = Router({ mergeParams: true })
		AccountCardProfileVCardsRoutes.addRoutes(router)
		return router
	}

	private static addRoutes(router: Router): void {

		router.post('/', async (req, res, next) => {

			const accountIdParam = (req.params as any).accountId as string
			const cardIdParam = (req.params as any).cardId as string
			const profileIdParam = (req.params as any).profileId as string

			if (IdValidator.isInvalidForRead(accountIdParam) || 
					IdValidator.isInvalidForRead(cardIdParam) ||
					IdValidator.isInvalidForRead(profileIdParam) ||
					VCardValidator.isInvalidForCreateOrUpdate(req.body)) {
				res.status(400).send()
				return
			}

			if (accountIdParam != res.locals.accountId) {
				res.status(403).send()
				return
			}

			try {
				res.json(await VCardService.createForProfileForCardForAccount(
					accountIdParam,
					cardIdParam,
					profileIdParam,
					AccountProfileVCardsRoutes.mapVCard(req.body)))
			} catch (err) {
				next(err)
				return
			}
		})

		router.put('/:vcardId', async (req, res, next) => {

			const accountIdParam = (req.params as any).accountId as string
			const cardIdParam = (req.params as any).cardId as string
			const profileIdParam = (req.params as any).profileId
			const vcardIdParam = req.params.vcardId

			if (IdValidator.isInvalidForRead(accountIdParam) ||
					IdValidator.isInvalidForRead(cardIdParam) ||
					IdValidator.isInvalidForRead(profileIdParam) ||
					IdValidator.isInvalidForRead(vcardIdParam) ||
					VCardValidator.isInvalidForCreateOrUpdate(req.body)) {
				res.status(400).send()
				return
			}

			if (accountIdParam != res.locals.accountId) {
				res.status(403).send()
				return
			}

			try {
				res.json(await VCardService.updateForProfileForCardForAccount(accountIdParam, cardIdParam, profileIdParam, AccountProfileVCardsRoutes.mapVCard(req.body, vcardIdParam)))
			} catch (err) {
				next(err)
				return
			}
		})

		router.delete('/:vcardId', async (req, res, next) => {
			const accountIdParam = (req.params as any).accountId as string
			const cardIdParam = (req.params as any).cardId as string
			const profileIdParam = (req.params as any).profileId
			const vcardIdParam = req.params.vcardId

			if (IdValidator.isInvalidForRead(accountIdParam) ||
					IdValidator.isInvalidForRead(cardIdParam) ||
					IdValidator.isInvalidForRead(profileIdParam) ||
					IdValidator.isInvalidForRead(vcardIdParam)) {
				res.status(400).send()
				return
			}

			if (accountIdParam != res.locals.accountId) {
				res.status(403).send()
				return
			}

			try {
				res.json(await VCardService.deleteForProfileForCardForAccount(accountIdParam, cardIdParam, profileIdParam, vcardIdParam))
			} catch (err) {
				next(err)
				return
			}
		})

	}


}