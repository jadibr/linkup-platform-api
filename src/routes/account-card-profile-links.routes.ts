import { Router } from "express"

import { IdValidator } from "../validators/id.validator"
import { AccountCardProfilesRoutes } from "./account-card-profiles.routes"
import { ProfileLinkValidator } from "../validators/profile-link.validator"
import { ProfileLinkService } from "../services/profile-link.service"
import { AccountProfileLinksRoutes } from "./account-profile-links.routes"


export abstract class AccountCardProfileLinksRoutes {
	public static accountCardProfileLinksPath = `${AccountCardProfilesRoutes.accountCardProfilesPath}/:profileId/links`

	public static addAccountCardProfileLinksRoutes(): Router {
		const router = Router({ mergeParams: true })
		AccountCardProfileLinksRoutes.addRoutes(router)
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
					ProfileLinkValidator.isInvalidForCreateOrUpdate(req.body)) {
				res.status(400).send()
				return
			}

			if (accountIdParam != res.locals.accountId) {
				res.status(403).send()
				return
			}

			try {
				res.json(await ProfileLinkService.createForProfileForCardForAccount(
					accountIdParam,
					cardIdParam,
					profileIdParam,
					AccountProfileLinksRoutes.mapLink(req.body)))
			} catch (err) {
				next(err)
				return
			}
		})

		router.put('/:linkId', async (req, res, next) => {

			const accountIdParam = (req.params as any).accountId as string
			const cardIdParam = (req.params as any).cardId as string
			const profileIdParam = (req.params as any).profileId
			const linkIdParam = req.params.linkId

			if (IdValidator.isInvalidForRead(accountIdParam) ||
					IdValidator.isInvalidForRead(cardIdParam) ||
					IdValidator.isInvalidForRead(profileIdParam) ||
					IdValidator.isInvalidForRead(linkIdParam) ||
					ProfileLinkValidator.isInvalidForCreateOrUpdate(req.body)) {
				res.status(400).send()
				return
			}

			if (accountIdParam != res.locals.accountId) {
				res.status(403).send()
				return
			}

			try {
				res.json(await ProfileLinkService.updateForProfileForCardForAccount(
					accountIdParam,
					cardIdParam,
					profileIdParam,
					AccountProfileLinksRoutes.mapLink(req.body, linkIdParam)))
			} catch (err) {
				next(err)
				return
			}
		})

		router.delete('/:linkId', async (req, res, next) => {
			const accountIdParam = (req.params as any).accountId as string
			const cardIdParam = (req.params as any).cardId as string
			const profileIdParam = (req.params as any).profileId
			const linkIdParam = req.params.linkId

			if (IdValidator.isInvalidForRead(accountIdParam) ||
					IdValidator.isInvalidForRead(cardIdParam) ||
					IdValidator.isInvalidForRead(profileIdParam) ||
					IdValidator.isInvalidForRead(linkIdParam)) {
				res.status(400).send()
				return
			}

			if (accountIdParam != res.locals.accountId) {
				res.status(403).send()
				return
			}

			try {
				res.json(await ProfileLinkService.deleteForProfileForCardForAccount(accountIdParam, cardIdParam, profileIdParam, linkIdParam))
			} catch (err) {
				next(err)
				return
			}
		})

	}


}