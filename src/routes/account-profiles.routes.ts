import { Router } from "express"

import { IdValidator } from "../validators/id.validator"
import { ProfileService } from "../services/profile.service"
import { AccountsRoutes } from "./accounts.routes"
import { ProfileValidator } from "../validators/profile.validator"
import { ProfilesRoutes } from "./profiles.routes"


export abstract class AccountProfilesRoutes {
	public static accountProfilesPath = `${AccountsRoutes.accountsPath}/:accountId/profiles`

	public static addAccountProfilesRoutes(): Router {
		const router = Router({ mergeParams: true })
		AccountProfilesRoutes.addRoutes(router)
		return router
	}

	private static addRoutes(router: Router): void {

		router.post('/', async (req, res, next) => {
			const accountIdParam = (req.params as any).accountId  as string

			if (IdValidator.isInvalidForRead(accountIdParam) ||
					ProfileValidator.isInvalidForCreateOrUpdate(req.body)) {
				res.status(400).send()
				return
			}

			if (accountIdParam != res.locals.accountId) {
				res.status(403).send()
				return
			}

			try {
				res.json(await ProfileService.createForAccount(accountIdParam, ProfilesRoutes.mapProfile(req.body)))
			} catch (err) {
				next(err)
				return
			}

		})

		router.put('/:profileId', async (req, res, next) => {

			const accountIdParam = (req.params as any).accountId as string
			const profileIdParam = req.params.profileId

			if (IdValidator.isInvalidForRead(accountIdParam) ||
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
				res.json(await ProfileService.updateForAccount(accountIdParam, ProfilesRoutes.mapProfile(req.body, profileIdParam)))
			} catch (err) {
				next(err)
				return
			}
		})

		router.delete('/:profileId', async (req, res, next) => {
			const accountIdParam = (req.params as any).accountId as string
			const profileIdParam = req.params.profileId

			if (IdValidator.isInvalidForRead(accountIdParam) ||
					IdValidator.isInvalidForRead(profileIdParam)) {
				res.status(400).send()
				return
			}

			if (accountIdParam != res.locals.accountId) {
				res.status(403).send()
				return
			}

			try {
				res.json(await ProfileService.deleteForAccount(accountIdParam, profileIdParam))
			} catch (err) {
				next(err)
				return
			}
		})

	}

}