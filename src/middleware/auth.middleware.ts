import express from "express"

import { AuthenticationService } from "../services/authentication.service"


export abstract class AuthMiddleware {

	public static getAuthFunction(errorWhenAuthenticationFails = true) {

		return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
			const authHeader = req.headers.authorization
			const token = authHeader?.split(' ')[1]

			let accountId
	
			if (token == null || token == "" ||
					(accountId = await AuthenticationService.getAccountIdFromAccessToken(token)) == null) {
				if (errorWhenAuthenticationFails) {
					res.status(401).send()
					return
				}
				next()
				return
			}

			res.locals.accountId = accountId
			next()
		}
	}

}