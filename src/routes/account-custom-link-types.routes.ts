import { Router } from "express"

import { IdValidator } from "../validators/id.validator"
import { AccountsRoutes } from "./accounts.routes"
import { CustomLinkType } from "../types/custom-link-type"
import { CustomLinkTypeValidator } from "../validators/custom-link-type.validator"
import { CustomLinkTypeService } from "../services/custom-link-type.services"


export abstract class AccountCustomLinkTypesRoutes {
	public static accountCustomLinkTypesPath = `${AccountsRoutes.accountsPath}/:accountId/custom-link-types`

	public static addAccountCustomLinkTypesRoutes(): Router {
		const router = Router({ mergeParams: true })
		AccountCustomLinkTypesRoutes.addRoutes(router)
		return router
	}

	public static mapCustomLinkType(customLink: any, id: string | null = null): CustomLinkType {
		return new CustomLinkType(
			id ?? (customLink as CustomLinkType).id ?? null,
			(customLink as CustomLinkType).name == null ?
				undefined :
				(customLink as CustomLinkType).name
		)
	}

	private static addRoutes(router: Router): void {

		router.post('/', async (req, res, next) => {
			const accountIdParam = (req.params as any).accountId as string

			if (IdValidator.isInvalidForRead(accountIdParam) ||
					CustomLinkTypeValidator.isInvalidForCreateOrUpdate(req.body)) {
				res.status(400).send()
				return
			}

			if (accountIdParam != res.locals.accountId) {
				res.status(403).send()
				return
			}

			try {
				res.json(await CustomLinkTypeService.create(accountIdParam, AccountCustomLinkTypesRoutes.mapCustomLinkType(req.body)))
			} catch (err) {
				next(err)
				return
			}
		})

		router.put('/:customLinkTypeId', async (req, res, next) => {

			const accountIdParam = (req.params as any).accountId as string
			const customLinkTypeIdParam = req.params.customLinkTypeId

			if (IdValidator.isInvalidForRead(accountIdParam) ||
					IdValidator.isInvalidForRead(customLinkTypeIdParam) ||
					CustomLinkTypeValidator.isInvalidForCreateOrUpdate(req.body)) {
				res.status(400).send()
				return
			}

			if (accountIdParam != res.locals.accountId) {
				res.status(403).send()
				return
			}

			try {
				res.json(await CustomLinkTypeService.update(accountIdParam, AccountCustomLinkTypesRoutes.mapCustomLinkType(req.body, customLinkTypeIdParam)))
			} catch (err) {
				next(err)
				return
			}
		})

		router.delete('/:customLinkTypeId', async (req, res, next) => {

			const accountIdParam = (req.params as any).accountId as string
			const customLinkTypeIdParam = req.params.customLinkTypeId

			if (IdValidator.isInvalidForRead(accountIdParam) ||
					IdValidator.isInvalidForRead(customLinkTypeIdParam)) {
				res.status(400).send()
				return
			}

			if (accountIdParam != res.locals.accountId) {
				res.status(403).send()
				return
			}

			try {
				res.json(await CustomLinkTypeService.delete(accountIdParam, customLinkTypeIdParam))
			} catch (err) {
				next(err)
				return
			}
		})

	}


}