import { Router } from "express"

import { IdValidator } from "../validators/id.validator"
import { AccountProfilesRoutes } from "./account-profiles.routes"
import { ProfilePhotoService } from "../services/profile-photos.service"
import { ImageFileValidator } from "../validators/image-file.validator"


export abstract class AccountProfilePhotosRoutes {
	public static accountProfilePhotosPath = `${AccountProfilesRoutes.accountProfilesPath}/:profileId/photos`

	public static addAccountProfilePhotosRoutes(): Router {
		const router = Router({ mergeParams: true })
		AccountProfilePhotosRoutes.addRoutes(router)
		return router
	}

	private static addRoutes(router: Router): void {

		router.post('/', async (req, res, next) => {
			const accountIdParam = (req.params as any).accountId as string
			const profileIdParam = (req.params as any).profileId as string

			if (IdValidator.isInvalidForRead(accountIdParam) ||
					IdValidator.isInvalidForRead(profileIdParam)) {
				res.status(400).send()
				return
			}

			if (accountIdParam != res.locals.accountId) {
				res.status(403).send()
				return
			}

			const profilePhotoFile = await ImageFileValidator.parseAndValidateImageFile(accountIdParam, null, profileIdParam, req)

			if (profilePhotoFile == null) {
				res.status(400).send()
				return
			}

			try {
				res.json(await ProfilePhotoService.createForProfileForAccount(
					accountIdParam,
					profileIdParam,
					profilePhotoFile))
			} catch (err) {
				next(err)
				return
			}

		})

		router.put('/:photoId', async (req, res, next) => {
			const accountIdParam = (req.params as any).accountId as string
			const profileIdParam = (req.params as any).profileId as string
			const photoIdParam = req.params.photoId as string

			if (IdValidator.isInvalidForRead(accountIdParam) ||
					IdValidator.isInvalidForRead(profileIdParam) ||
					IdValidator.isInvalidForRead(photoIdParam)) {
				res.status(400).send()
				return
			}

			if (accountIdParam != res.locals.accountId) {
				res.status(403).send()
				return
			}

			const profilePhotoFile = await ImageFileValidator.parseAndValidateImageFile(accountIdParam, null, profileIdParam, req)

			if (profilePhotoFile == null) {
				res.status(400).send()
				return
			}

			try {
				res.json(await ProfilePhotoService.updateForProfileForAccount(
					accountIdParam,
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
			const profileIdParam = (req.params as any).profileId as string
			const photoIdParam = req.params.photoId as string

			if (IdValidator.isInvalidForRead(accountIdParam) ||
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
				res.json(await ProfilePhotoService.deleteForProfileForAccount(accountIdParam, profileIdParam, photoIdParam))
			} catch (err) {
				next(err)
				return
			}
		})

	}

}