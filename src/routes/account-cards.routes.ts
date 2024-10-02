import { Router } from "express"

import { IdValidator } from "../validators/id.validator"
import { AccountsRoutes } from "./accounts.routes"
import { CardValidator } from "../validators/card.validator"
import { CardService } from "../services/card.service"
import { Card } from "../types/card"


export abstract class AccountCardsRoutes {
	public static accountCardsPath = `${AccountsRoutes.accountsPath}/:accountId/cards`

	public static addAccountCardsRoutes(): Router {
		const router = Router({ mergeParams: true })
		AccountCardsRoutes.addRoutes(router)
		return router
	}

	public static mapCard(card: any, id: string | null = null): Card {
		return new Card(
			id ?? (card as Card).id ?? null,
			(card as Card).name == null ?
				undefined :
				(card as Card).name,
			(card as Card).profile == null ?
				undefined :
				(card as Card).profile,
			(card as Card).isActive == null ?
				undefined :
				(card as Card).isActive,
			(card as Card).isDisabled == null ?
				undefined :
				(card as Card).isDisabled
		)
	}

	private static addRoutes(router: Router): void {

		router.put('/:cardId', async (req, res, next) => {

			const accountIdParam = (req.params as any).accountId as string
			const cardIdParam = req.params.cardId

			if (IdValidator.isInvalidForRead(accountIdParam) ||
					IdValidator.isInvalidForRead(cardIdParam) ||
					CardValidator.isInvalidForCreateOrUpdate(req.body)) {
				res.status(400).send()
				return
			}

			if (accountIdParam != res.locals.accountId) {
				res.status(403).send()
				return
			}

			try {
				res.json(await CardService.update(accountIdParam, AccountCardsRoutes.mapCard(req.body, cardIdParam)))
			} catch (err) {
				next(err)
				return
			}
		})

	}


}