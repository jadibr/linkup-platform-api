import { Router } from "express"
import { AuthenticationService } from "../services/authentication.service"

export abstract class RefreshTokenRoutes {

	public static refreshTokenPath = '/refresh-token'

	public static addRefreshTokenRoutes(): Router {
		const router = Router()
		RefreshTokenRoutes.addRoutes(router)
		return router
	}

	private static addRoutes(router: Router) {
		router.post('/', async (req, res, next) => {
			if (req.body.refreshToken == null || req.body.refreshToken == "") {
				res.status(400).send()
				return
			}
			try {
				res.status(201).json(await AuthenticationService.refreshToken(req.body.refreshToken))
				return
			} catch (err) {
				next(err)
				return
			}
		})
	}
}