
import { Document } from "mongoose"

import { ReferencedResourceNotFoundError } from "../errors/referenced-resource-not-found.error"
import { Logger } from "../logger"
import { Card } from "../types/card"
import { AccountService } from "./account.service"
import { DatabaseError } from "../errors/database.error"
import { CardDbModel } from "../db-models/card.db-model"


export abstract class CardService {

	public static async update(accountId: string, card: Card): Promise<Card> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when updating card ${card.id}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when updating card ${card.id}`)
		}

		const cardDoc = accountDoc.cards?.find(c => (c as unknown as Document).id == card.id)

		if (cardDoc == null) {
			Logger.logger.warn(`Card ${card.id} not found when attempting to update it (account ${accountDoc.id}})`)
			throw new ReferencedResourceNotFoundError(`Card ${card.id} not found when attempting to update it (account ${accountDoc.id}})`)
		}

		cardDoc.name = card.name
		cardDoc.isActive = card.isActive

		try {
			accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to update account ${accountId} when updating card ${card.id}`, err)
			throw new DatabaseError(`Failed to update account ${accountId} when updating card ${card.id}`)
		}

		return CardDbModel.convertToDomainModel(cardDoc)
	}

}