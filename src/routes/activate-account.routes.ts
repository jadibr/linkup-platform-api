import { Router } from "express"

import { AccountService } from "../services/account.service"
import { AccountActivateValidator } from "../validators/account-activate.validator"


export abstract class ActivateAccountRoutes {

	public static activateAccountPath = '/activate-account'

	public static addActivateAccountRoutes(): Router {
		const router = Router()
		ActivateAccountRoutes.addRoutes(router)
		return router
	}

	private static addRoutes(router: Router) {

		router.post('/', async (req, res, next) => {
			if (AccountActivateValidator.isInvalidForRead(req.body)) {
				res.status(400).send()
				return
			}

			try {
				await AccountService.activateAccount(req.body.accountId, req.body.activationTokenId)
			} catch (err) {
				next(err)
				return
			}

			res.status(204).send()
			return
		})

	}
}
