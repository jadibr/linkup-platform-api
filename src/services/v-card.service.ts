import { Document } from "mongoose"

import { AccountService } from "./account.service"
import { Logger } from "../logger"
import { ReferencedResourceNotFoundError } from "../errors/referenced-resource-not-found.error"
import { DatabaseError } from "../errors/database.error"
import { ResourceAlreadyExistsError } from "../errors/resource-already-exists.error"
import { VCard } from "../types/vcard"
import { VCardDbModel } from "../db-models/v-card.db-model"


export abstract class VCardService {

	public static async createForProfileForAccount(accountId: string, profileId: string, vcard: VCard): Promise<VCard> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when creating a v-card for profile ${profileId}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when creating a v-card for profile ${profileId}`)
		}

		if (accountDoc.profile == null || (accountDoc.profile as unknown as Document).id != profileId) {
			Logger.logger.warn(`Profile ${profileId} not found when creating a v-card for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Profile ${profileId} not found when creating a v-card for account ${accountId}`)
		}

		if (accountDoc.profile.vCard != null) {
			Logger.logger.warn(`Account's ${accountId} profile ${profileId} already has a v-card`)
			throw new ResourceAlreadyExistsError(`Account's ${accountId} profile ${profileId} already has a v-card`)
		}

		const vcardDoc = VCardDbModel.convertToDbModel(vcard)
		accountDoc.profile.vCard = vcardDoc

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account '${accountId}' when creating a v-card for profile ${profileId}`, err)
			throw new DatabaseError(`Failed to save account '${accountId}' when creating a v-card for profile ${profileId}`)
		}

		return VCardDbModel.convertToDomainModel(accountDoc.profile.vCard)
	}

	public static async createForProfileForCardForAccount(accountId: string, cardId: string, profileId: string, vcard: VCard): Promise<VCard> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when creating a v-card for card ${cardId} for profile ${profileId}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when creating a v-card for card ${cardId} for profile ${profileId}`)
		}

		const card =  accountDoc.cards?.find(c => (c as unknown as Document).id == cardId)

		if (card == null) {
			Logger.logger.warn(`Card ${cardId} not found when creating a v-card for account ${accountId} for profile ${profileId}`)
			throw new ReferencedResourceNotFoundError(`Card ${cardId} not found when creating a v-card for account ${accountId} for profile ${profileId}`)
		}

		if (card.profile == null || (card.profile as unknown as Document).id != profileId) {
			Logger.logger.warn(`Profile ${profileId} not found when creating a v-card for account ${accountId} for card ${cardId}`)
			throw new ReferencedResourceNotFoundError(`Profile ${profileId} not found when creating a v-card for account ${accountId} for card ${cardId}`)
		}

		if (card.profile.vCard != null) {
			Logger.logger.warn(`Account's ${accountId} card's ${cardId} profile ${profileId} already has a v-card`)
			throw new ResourceAlreadyExistsError(`Account's ${accountId} card's ${cardId} profile ${profileId} already has a v-card`)
		}

		const vcardDoc = VCardDbModel.convertToDbModel(vcard)
		card.profile.vCard = vcardDoc

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account '${accountId}' when adding a v-card for card ${cardId} for profle ${profileId}`, err)
			throw new DatabaseError(`Failed to save account '${accountId}' when adding a v-card for card ${cardId} for profle ${profileId}`)
		}

		return VCardDbModel.convertToDomainModel(card.profile.vCard)
	}

	public static async updateForProfileForAccount(accountId: string, profileId: string, vcard: VCard): Promise<VCard> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when updating v-card ${vcard.id} for profile ${profileId}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when updating v-card ${vcard.id} for profile ${profileId}`)
		}

		if (accountDoc.profile == null || (accountDoc.profile as unknown as Document).id != profileId) {
			Logger.logger.warn(`Profile ${profileId} not found when updating v-card ${vcard.id} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Profile ${profileId} not found when updating v-card ${vcard.id} for account ${accountId}`)
		}

		if (accountDoc.profile.vCard == null || (accountDoc.profile.vCard as unknown as Document).id != vcard.id) {
			Logger.logger.warn(`V-card ${vcard.id} not found when attempting to update it for profile ${profileId} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`V-card ${vcard.id} not found when attempting to update it for profile ${profileId} for account ${accountId}`)
		}

		accountDoc.profile.vCard.name = vcard.name
		accountDoc.profile.vCard.surname = vcard.surname
		accountDoc.profile.vCard.organization = vcard.organization
		accountDoc.profile.vCard.workPhone = vcard.workPhone
		accountDoc.profile.vCard.homePhone = vcard.homePhone
		accountDoc.profile.vCard.email = vcard.email
		accountDoc.profile.vCard.websiteUrl = vcard.websiteUrl

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account '${accountId}' when updating v-card ${vcard.id} for profile ${profileId}`, err)
			throw new DatabaseError(`Failed to save account '${accountId}' when updating v-card ${vcard.id} for profile ${profileId}`)
		}

		return VCardDbModel.convertToDomainModel(accountDoc.profile.vCard)
	}

	public static async updateForProfileForCardForAccount(accountId: string, cardId: string, profileId: string, vcard: VCard): Promise<VCard> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when updating v-card ${vcard.id} for card ${cardId} for profile ${profileId}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when updating v-card ${vcard.id} for card ${cardId} for profile ${profileId}`)
		}

		const card =  accountDoc.cards?.find(c => (c as unknown as Document).id == cardId)

		if (card == null) {
			Logger.logger.warn(`Card ${cardId} not found when updating v-card ${vcard.id} for account ${accountId} for profile ${profileId}`)
			throw new ReferencedResourceNotFoundError(`Card ${cardId} not found when updating v-card ${vcard.id} for account ${accountId} for profile ${profileId}`)
		}

		if (card.profile == null || (card.profile as unknown as Document).id != profileId) {
			Logger.logger.warn(`Profile ${profileId} not found when updating v-card ${vcard.id} for account ${accountId} for card ${cardId}`)
			throw new ReferencedResourceNotFoundError(`Profile ${profileId} not found when updating v-card ${vcard.id} for account ${accountId} for card ${cardId}`)
		}

		if (card.profile.vCard == null || (card.profile.vCard as unknown as Document).id != vcard.id) {
			Logger.logger.warn(`V-card ${vcard.id} not found when attempting to update it for profile ${profileId} for card ${cardId} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`V-card ${vcard.id} not found when attempting to update it for profile ${profileId} for card ${cardId} for account ${accountId}`)
		}

		card.profile.vCard.name = vcard.name
		card.profile.vCard.surname = vcard.surname
		card.profile.vCard.organization = vcard.organization
		card.profile.vCard.workPhone = vcard.workPhone
		card.profile.vCard.homePhone = vcard.homePhone
		card.profile.vCard.email = vcard.email
		card.profile.vCard.websiteUrl = vcard.websiteUrl

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account '${accountId}' when updating v-card ${vcard.id} for card ${cardId} for profle ${profileId}`, err)
			throw new DatabaseError(`Failed to save account '${accountId}' when updating v-card ${vcard.id} for card ${cardId} for profle ${profileId}`)
		}

		return VCardDbModel.convertToDomainModel(card.profile.vCard)
	}

	public static async deleteForProfileForAccount(accountId: string, profileId: string, vcardId: string): Promise<void> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when deleting v-card ${vcardId} for profile ${profileId}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when deleting v-card ${vcardId} for profile ${profileId}`)
		}

		if (accountDoc.profile == null || (accountDoc.profile as unknown as Document).id != profileId) {
			Logger.logger.warn(`Profile ${profileId} not found when deleting v-card ${vcardId} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Profile ${profileId} not found when deleting v-card ${vcardId} for account ${accountId}`)
		}

		if (accountDoc.profile.vCard == null || (accountDoc.profile.vCard as unknown as Document).id != vcardId) {
			Logger.logger.warn(`V-card ${vcardId} not found when attempting to delete it for profile ${profileId} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`V-card ${vcardId} not found when attempting to delete it for profile ${profileId} for account ${accountId}`)
		}

		accountDoc.profile.vCard = undefined

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account '${accountId}' when deleting v-card ${vcardId} for profile ${profileId}`, err)
			throw new DatabaseError(`Failed to save account '${accountId}' when deleting v-card ${vcardId} for profile ${profileId}`)
		}
	}

	public static async deleteForProfileForCardForAccount(accountId: string, cardId: string, profileId: string, vcardId: string): Promise<void> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when deleting v-card ${vcardId} for card ${cardId} for profile ${profileId}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when deleting v-card ${vcardId} for card ${cardId} for profile ${profileId}`)
		}

		const card =  accountDoc.cards?.find(c => (c as unknown as Document).id == cardId)

		if (card == null) {
			Logger.logger.warn(`Card ${cardId} not found when deleting v-card ${vcardId} for account ${accountId} for profile ${profileId}`)
			throw new ReferencedResourceNotFoundError(`Card ${cardId} not found when deleting v-card ${vcardId} for account ${accountId} for profile ${profileId}`)
		}

		if (card.profile == null || (card.profile as unknown as Document).id != profileId) {
			Logger.logger.warn(`Profile ${profileId} not found when deleting v-card ${vcardId} for account ${accountId} for card ${cardId}`)
			throw new ReferencedResourceNotFoundError(`Profile ${profileId} not found when deleting v-card ${vcardId} for account ${accountId} for card ${cardId}`)
		}

		if (card.profile.vCard == null || (card.profile.vCard as unknown as Document).id != vcardId) {
			Logger.logger.warn(`V-card ${vcardId} not found when attempting to delete it for profile ${profileId} for card ${cardId} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`V-card ${vcardId} not found when attempting to delete it for profile ${profileId} for card ${cardId} for account ${accountId}`)
		}

		card.profile.vCard = undefined

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account '${accountId}' when deleting v-card ${vcardId} for card ${cardId} for profle ${profileId}`, err)
			throw new DatabaseError(`Failed to save account '${accountId}' when deleting v-card ${vcardId} for card ${cardId} for profle ${profileId}`)
		}
	}

}