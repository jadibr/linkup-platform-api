import { Router } from "express"

import { AccountValidator } from "../validators/account.validator"
import { Account } from "../types/account"
import { AccountService } from "../services/account.service"
import { IdValidator } from "../validators/id.validator"


export abstract class AccountsRoutes {
	public static accountsPath = '/accounts'

	public static addBusinessesRoutes(): Router {
		const router = Router()
		AccountsRoutes.addRoutes(router)
		return router
	}

	private static addRoutes(router: Router): void {

		router.get('/:accountId', async (req, res, next) => {

			const accountIdParam = req.params.accountId

			if (IdValidator.isInvalidForRead(accountIdParam)) {
				res.status(400).send()
				return
			}

			if (res.locals.accountId == null) {
				res.status(401).send()
				return
			}
			if (accountIdParam != res.locals.accountId) {
				res.status(403).send()
				return
			}

			try {
				res.json(await AccountService.getById(accountIdParam))
			} catch (err) {
				next(err)
				return
			}
		})

		router.post('/', async (req, res, next) => {
			if (AccountValidator.isInvalidForCreate(req.body)) {
				res.status(400).send()
				return
			}

			try {
				res.status(201).json(await AccountService.create(new Account(
					undefined,
					req.body.name,
					req.body.contactName,
					req.body.phone,
					req.body.email,
					req.body.password,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
				)))
				
				return
			} catch (err) {
				next(err)
				return
			}
			
		})

		router.put('/:accountId', async (req, res, next) => {

			const accountIdParam = req.params.accountId

			if (IdValidator.isInvalidForRead(accountIdParam) ||
					AccountValidator.isInvalidForUpdate(req.body)) {
				res.status(400).send()
				return
			}

			if (res.locals.accountId == null) {
				res.status(401).send()
				return
			}
			if (accountIdParam != res.locals.accountId) {
				res.status(403).send()
				return
			}

			try {
				res.json(await AccountService.update(AccountsRoutes.mapAccount(req.body, accountIdParam)))
			} catch (err) {
				next(err)
				return
			}
		})


	}

	private static mapAccount(account: any, id: string | null = null): Account {
		return new Account(
			id ?? (account as Account).id ?? null,
			(account as Account).name == null ?
				undefined :
				(account as Account).name,
			(account as Account).contactName == null ?
				undefined :
				(account as Account).contactName,
			(account as Account).phone == null ?
				undefined :
				(account as Account).phone,
			(account as Account).email == null ?
				undefined :
				(account as Account).email,
			(account as Account).password == null ?
				undefined :
				(account as Account).password,
			(account as Account).isActive == null ?
				undefined :
				(account as Account).isActive,
			(account as Account).isDisabled == null ?
				undefined :
				(account as Account).isDisabled,
			(account as Account).profile == null ?
				undefined :
				(account as Account).profile,
			(account as Account).cards == null ?
				undefined :
				(account as Account).cards,
			(account as Account).customProfileLinkTypes == null ?
				undefined :
				(account as Account).customProfileLinkTypes,
		)
	}

}