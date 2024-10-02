import { Router } from "express"

import { IdValidator } from "../validators/id.validator"
import { ProfilePhotoService } from "../services/profile-photos.service"
import { ImageFileValidator } from "../validators/image-file.validator"
import { AccountCardProfilesRoutes } from "./account-card-profiles.routes"


export abstract class AccountCardProfilePhotosRoutes {
	public static accountCardProfilePhotosPath = `${AccountCardProfilesRoutes.accountCardProfilesPath}/:profileId/photos`

	public static addAccountCardProfilePhotosRoutes(): Router {
		const router = Router({ mergeParams: true })
		AccountCardProfilePhotosRoutes.addRoutes(router)
		return router
	}

	private static addRoutes(router: Router): void {

		router.post('/', async (req, res, next) => {
			const accountIdParam = (req.params as any).accountId as string
			const cardIdParam = (req.params as any).cardId as string
			const profileIdParam = (req.params as any).profileId as string

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

			const profilePhotoFile = await ImageFileValidator.parseAndValidateImageFile(accountIdParam, cardIdParam, profileIdParam, req)

			if (profilePhotoFile == null) {
				res.status(400).send()
				return
			}

			try {
				res.json(await ProfilePhotoService.createForProfileForCardForAccount(
					accountIdParam,
					cardIdParam,
					profileIdParam,
					profilePhotoFile))
			} catch (err) {
				next(err)
				return
			}

		})

		router.put('/:photoId', async (req, res, next) => {
			const accountIdParam = (req.params as any).accountId as string
			const cardIdParam = (req.params as any).cardId as string
			const profileIdParam = (req.params as any).profileId as string
			const photoIdParam = req.params.photoId as string

			if (IdValidator.isInvalidForRead(accountIdParam) ||
					IdValidator.isInvalidForRead(cardIdParam) ||
					IdValidator.isInvalidForRead(profileIdParam) ||
					IdValidator.isInvalidForRead(photoIdParam)) {
				res.status(400).send()
				return
			}

			if (accountIdParam != res.locals.accountId) {
				res.status(403).send()
				return
			}

			const profilePhotoFile = await ImageFileValidator.parseAndValidateImageFile(accountIdParam, cardIdParam, profileIdParam, req)

			if (profilePhotoFile == null) {
				res.status(400).send()
				return
			}

			try {
				res.json(await ProfilePhotoService.updateForProfileForCardForAccount(
					accountIdParam,
					cardIdParam,
					profileIdParam,
					photoIdParam,
					profilePhotoFile))
			} catch (err) {
				next(err)
				return
			}

		})

		router.delete('/:photoId', async (req, res, next) => {
			const accountIdParam = (req.params as any).accountId as string
			const cardIdParam = (req.params as any).cardId as string
			const profileIdParam = (req.params as any).profileId as string
			const photoIdParam = req.params.photoId as string

			if (IdValidator.isInvalidForRead(accountIdParam) ||
					IdValidator.isInvalidForRead(cardIdParam) ||
					IdValidator.isInvalidForRead(profileIdParam) ||
					IdValidator.isInvalidForRead(photoIdParam)) {
				res.status(400).send()
				return
			}

			if (accountIdParam != res.locals.accountId) {
				res.status(403).send()
				return
			}

			try {
				res.json(await ProfilePhotoService.deleteForProfileForCardForAccount(accountIdParam, cardIdParam, profileIdParam, photoIdParam))
			} catch (err) {
				next(err)
				return
			}
		})

	}

}