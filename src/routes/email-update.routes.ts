import { Router } from "express"

import { AccountService } from "../services/account.service"
import { EmailUpdateValidator } from "../validators/email-update.validator"


export abstract class EmailUpdateRoutes {

	public static emailUpdatePath = '/email-update'

	public static addEmailUpdateRoutes(): Router {
		const router = Router()
		EmailUpdateRoutes.addRoutes(router)
		return router
	}

	private static addRoutes(router: Router) {

		router.post('/', async (req, res, next) => {

			if (EmailUpdateValidator.isInvalidForEmailUpdate(req.body)) {
				res.status(400).send()
				return
			}

			try {
				await AccountService.updateEmail(req.body.accountId, req.body.updateTokenId)
			} catch (err) {
				next(err)
				return
			}

			res.status(204).send()
			return
		})

		router.post('/new-token', async (req, res, next) => {

			if (EmailUpdateValidator.isInvalidForEmailUpdateTokenRequest(req.body)) {
				res.status(400).send()
				return
			}

			if (res.locals.accountId == null) {
				res.status(401).send()
				return
			}
			if (req.body.accountId!= res.locals.accountId) {
				res.status(403).send()
				return
			}

			try {
				await AccountService.createEmailUpdateToken(req.body.accountId, req.body.email)
			} catch (err) {
				next(err)
				return
			}

			res.status(204).send()
			return
		})
	}
}