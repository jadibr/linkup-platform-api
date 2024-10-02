import { Router } from "express"

import { IdValidator } from "../validators/id.validator"
import { AccountProfilesRoutes } from "./account-profiles.routes"
import { ProfileLink } from "../types/profile-link"
import { AccountCustomLinkTypesRoutes } from "./account-custom-link-types.routes"
import { ProfileLinkValidator } from "../validators/profile-link.validator"
import { ProfileLinkService } from "../services/profile-link.service"


export abstract class AccountProfileLinksRoutes {
	public static accountProfileLinksPath = `${AccountProfilesRoutes.accountProfilesPath}/:profileId/links`

	public static addAccountProfileLinksRoutes(): Router {
		const router = Router({ mergeParams: true })
		AccountProfileLinksRoutes.addRoutes(router)
		return router
	}

	public static mapLink(link: any, id: string | null = null): ProfileLink {
		return new ProfileLink(
			id ?? (link as ProfileLink).id ?? null,
			(link as ProfileLink).linkType == null ?
				undefined :
				(link as ProfileLink).linkType,
			(link as ProfileLink).name == null ?
				undefined :
				(link as ProfileLink).name,
			(link as ProfileLink).value == null ?
				undefined :
				(link as ProfileLink).value,
			(link as ProfileLink).orderNumber == null ?
				undefined :
				(link as ProfileLink).orderNumber,
			(link as ProfileLink).customLinkType == null ?
				undefined :
				AccountCustomLinkTypesRoutes.mapCustomLinkType((link as ProfileLink).customLinkType)
		)
	}

	private static addRoutes(router: Router): void {

		router.post('/', async (req, res, next) => {
			const accountIdParam = (req.params as any).accountId as string
			const profileIdParam = (req.params as any).profileId as string

			if (IdValidator.isInvalidForRead(accountIdParam) ||
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
				res.json(await ProfileLinkService.createForProfileForAccount(
					accountIdParam,
					profileIdParam,
					AccountProfileLinksRoutes.mapLink(req.body)))
			} catch (err) {
				next(err)
				return
			}

		})

		router.put('/:linkId', async (req, res, next) => {

			const accountIdParam = (req.params as any).accountId as string
			const profileIdParam = (req.params as any).profileId as string
			const linkIdParam = req.params.linkId

			if (IdValidator.isInvalidForRead(accountIdParam) ||
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
				res.json(await ProfileLinkService.updateForProfileForAccount(
					accountIdParam,
					profileIdParam,
					AccountProfileLinksRoutes.mapLink(req.body, linkIdParam)))
			} catch (err) {
				next(err)
				return
			}
		})

		router.delete('/:linkId', async (req, res, next) => {
			const accountIdParam = (req.params as any).accountId as string
			const profileIdParam = (req.params as any).profileId as string
			const linkIdParam = req.params.linkId

			if (IdValidator.isInvalidForRead(accountIdParam) ||
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
				res.json(await ProfileLinkService.deleteForProfileForAccount(accountIdParam, profileIdParam, linkIdParam))
			} catch (err) {
				next(err)
				return
			}
		})

	}

}