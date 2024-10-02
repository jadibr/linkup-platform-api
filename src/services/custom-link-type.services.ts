import { Document, Types } from "mongoose"

import { CustomLinkType } from "../types/custom-link-type"
import { ReferencedResourceNotFoundError } from "../errors/referenced-resource-not-found.error"
import { Logger } from "../logger"
import { AccountService } from "./account.service"
import { CustomLinkTypeDbModel, ICustomLinkType } from "../db-models/custom-link-type.db-model"
import { DatabaseError } from "../errors/database.error"


export abstract class CustomLinkTypeService {

	public static async create(accountId: string, customLinkType: CustomLinkType): Promise<CustomLinkType> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when creating a custom link type for it`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when creating a custom link type for it`)
		}

		let customLinkTypeDoc = (accountDoc.customProfileLinkTypes as Types.DocumentArray<ICustomLinkType>)
			.create(CustomLinkTypeDbModel.convertToDbModel(customLinkType))
		accountDoc.customProfileLinkTypes?.push(customLinkTypeDoc)

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account '${accountId}' when adding a custom link type`, err)
			throw new DatabaseError(`Failed to save account '${accountId}' when adding a custom link type`)
		}

		return CustomLinkTypeDbModel.convertToDomainModel(customLinkTypeDoc)
	}

	public static async update(accountId: string, customLinkType: CustomLinkType): Promise<CustomLinkType> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when updating custom link type ${customLinkType.id}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when updating custom link type ${customLinkType.id}`)
		}

		const customLinkTypeDoc = accountDoc.customProfileLinkTypes?.find(clt => (clt as unknown as Document).id == customLinkType.id)

		if (customLinkTypeDoc == null) {
			Logger.logger.warn(`Custom link type ${customLinkType.id} not found when updating it for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Custom link type ${customLinkType.id} not found when updating it for account ${accountId}`)
		}

		customLinkTypeDoc.name = customLinkType.name

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account '${accountId}' when updating custom link type ${customLinkType.id}`, err)
			throw new DatabaseError(`Failed to save account '${accountId}' when updating custom link type ${customLinkType.id}`)
		}

		return CustomLinkTypeDbModel.convertToDomainModel(customLinkTypeDoc)
	}

	public static async delete(accountId: string, customLinkTypeId: string): Promise<void> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when deleting custom link type ${customLinkTypeId}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when deleting custom link type ${customLinkTypeId}`)
		}

		const customLinkTypeDoc = accountDoc.customProfileLinkTypes?.find(clt => (clt as unknown as Document).id == customLinkTypeId)

		if (customLinkTypeDoc == null) {
			Logger.logger.warn(`Custom link type ${customLinkTypeId} not found when deleting it for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Custom link type ${customLinkTypeId} not found when deleting it for account ${accountId}`)
		}

		(customLinkTypeDoc as unknown as Types.ArraySubdocument).deleteOne()

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account '${accountId}' when deleting a custom link type ${customLinkTypeId}`, err)
			throw new DatabaseError(`Failed to save account '${accountId}' when deleting a custom link type ${customLinkTypeId}`)
		}
	}

}