import { Router } from "express"

import { IdValidator } from "../validators/id.validator"
import { AccountProfilesRoutes } from "./account-profiles.routes"
import { VCardService } from "../services/v-card.service"
import { VCard } from "../types/vcard"
import { VCardValidator } from "../validators/v-card.validator"


export abstract class AccountProfileVCardsRoutes {
	public static accountProfileVCardsPath = `${AccountProfilesRoutes.accountProfilesPath}/:profileId/v-cards`

	public static addAccountProfileVCardsRoutes(): Router {
		const router = Router({ mergeParams: true })
		AccountProfileVCardsRoutes.addRoutes(router)
		return router
	}
	
	public static mapVCard(vCard: any, id: string | null = null): VCard {
		return new VCard(
			id ?? (vCard as VCard).id ?? null,
			(vCard as VCard).name == null ?
				undefined :
				(vCard as VCard).name,
			(vCard as VCard).surname == null ?
				undefined :
				(vCard as VCard).surname,
			(vCard as VCard).organization == null ?
				undefined :
				(vCard as VCard).organization,
			(vCard as VCard).workPhone == null ?
				undefined :
				(vCard as VCard).workPhone,
			(vCard as VCard).homePhone == null ?
				undefined :
				(vCard as VCard).homePhone,
			(vCard as VCard).email == null ?
				undefined :
				(vCard as VCard).email,
			(vCard as VCard).websiteUrl == null ?
				undefined :
				(vCard as VCard).websiteUrl
		)
	}

	private static addRoutes(router: Router): void {

		router.post('/', async (req, res, next) => {
			const accountIdParam = (req.params as any).accountId as string
			const profileIdParam = (req.params as any).profileId as string

			if (IdValidator.isInvalidForRead(accountIdParam) ||
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
				res.json(await VCardService.createForProfileForAccount(
					accountIdParam,
					profileIdParam,
					AccountProfileVCardsRoutes.mapVCard(req.body)))
			} catch (err) {
				next(err)
				return
			}

		})

		router.put('/:vcardId', async (req, res, next) => {

			const accountIdParam = (req.params as any).accountId as string
			const profileIdParam = (req.params as any).profileId as string
			const vcardIdParam = req.params.vcardId

			if (IdValidator.isInvalidForRead(accountIdParam) ||
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
				res.json(await VCardService.updateForProfileForAccount(
					accountIdParam,
					profileIdParam,
					AccountProfileVCardsRoutes.mapVCard(req.body, vcardIdParam)))
			} catch (err) {
				next(err)
				return
			}
		})

		router.delete('/:vcardId', async (req, res, next) => {
			const accountIdParam = (req.params as any).accountId as string
			const profileIdParam = (req.params as any).profileId as string
			const vcardIdParam = req.params.vcardId

			if (IdValidator.isInvalidForRead(accountIdParam) ||
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
				res.json(await VCardService.deleteForProfileForAccount(accountIdParam, profileIdParam, vcardIdParam))
			} catch (err) {
				next(err)
				return
			}
		})

	}

}