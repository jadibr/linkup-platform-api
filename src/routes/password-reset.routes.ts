import { Router } from "express"

import { AccountService } from "../services/account.service"
import { PasswordResetValidator } from "../validators/password-reset.validator"


export abstract class PasswordResetRoutes {

	public static passwordResetPath = '/password-reset'

	public static addPasswordResetRoutes(): Router {
		const router = Router()
		PasswordResetRoutes.addRoutes(router)
		return router
	}

	private static addRoutes(router: Router) {

		router.post('/', async (req, res, next) => {

			if (PasswordResetValidator.isInvalidForNewPassword(req.body)) {
				res.status(400).send()
				return
			}

			try {
				await AccountService.resetPassword(req.body.accountId, req.body.resetTokenId, req.body.password)
			} catch (err) {
				next(err)
				return
			}

			res.status(204).send()
			return
		})

		router.post('/new-token', async (req, res, next) => {

			if (PasswordResetValidator.isInvalidForPasswordResetTokenRequest(req.body)) {
				res.status(400).send()
				return
			}

			try {
				await AccountService.createPasswordResetToken(req.body.email)
			} catch (err) {
				next(err)
				return
			}

			res.status(204).send()
			return
		})
	}
}