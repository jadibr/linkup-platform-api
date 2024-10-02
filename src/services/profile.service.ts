import { Document } from "mongoose"

import { Profile } from "../types/profile"
import { ProfileDbModel } from "../db-models/profile.db-model"
import { AccountService } from "./account.service"
import { Logger } from "../logger"
import { ReferencedResourceNotFoundError } from "../errors/referenced-resource-not-found.error"
import { DatabaseError } from "../errors/database.error"
import { ProfileTheme } from "../types/enums/profile-theme"
import { ResourceAlreadyExistsError } from "../errors/resource-already-exists.error"
import { AccountDbModel } from "../db-models/account.db-model"
import { ProfilePhotoService } from "./profile-photos.service"


export abstract class ProfileService {

	public static async getById(profileId: string): Promise<Profile> {
		const accountDoc = await AccountService.getForProfile(profileId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account with profile ${profileId} not found when retrieving profile by id`)
			throw new ReferencedResourceNotFoundError(`Account with profile ${profileId} not found when retrieving profile by id`)
		}

		const account = AccountDbModel.convertToDomainModel(accountDoc)
		const profile = account.getProfile(profileId)

		if (profile == null) {
			Logger.logger.warn(`Profile ${profileId} not found when retrieving profile for account (${accountDoc.id})`)
			throw new ReferencedResourceNotFoundError(`Profile ${profileId} not found when retrieving profile for account (${accountDoc.id})`)
		}

		return profile
	}

	public static async getForCard(cardId: string): Promise<Profile> {
		const accountDoc = await AccountService.getForCard(cardId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account with card ${cardId} not found when retrieving profile for card`)
			throw new ReferencedResourceNotFoundError(`Account with card ${cardId} not found when retrieving profile for card`)
		}

		const card =  accountDoc.cards?.find(c => (c as unknown as Document).id == cardId)

		if (card == null) {
			Logger.logger.warn(`Card ${cardId} not found when retrieving profile for card`)
			throw new ReferencedResourceNotFoundError(`Card ${cardId} not found when retrieving profile for card`)
		}

		if (card.profile == null) {
			Logger.logger.warn(`Card's ${cardId} profile not found when retrieving profile for card`)
			throw new ReferencedResourceNotFoundError(`Card's ${cardId} profile not found when retrieving profile for card`)
		}

		return ProfileDbModel.convertToDomainModel(card.profile)
	}

	public static async createForAccount(accountId: string, profile: Profile): Promise<Profile> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when creating a profile for it`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when creating a profile for it`)
		}

		if (accountDoc.profile != null) {
			Logger.logger.warn(`Account ${accountId} already has a profile`)
			throw new ResourceAlreadyExistsError(`Account ${accountId} already has a profile`)
		}

		profile.photo = undefined
		profile.vCard = undefined
		profile.links = undefined
		profile.theme = ProfileTheme.Golden

		const profileDoc = ProfileDbModel.convertToDbModel(profile)
		accountDoc.profile = profileDoc

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account '${accountId}' when creating a profile for it`, err)
			throw new DatabaseError(`Failed to save account '${accountId}' when creating a profile for it`)
		}

		return ProfileDbModel.convertToDomainModel(accountDoc.profile)
	}

	public static async createForCardForAccount(accountId: string, cardId: string, profile: Profile): Promise<Profile> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when creating a profile for card ${cardId}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when creating a profile for card ${cardId}`)
		}

		const card =  accountDoc.cards?.find(c => (c as unknown as Document).id == cardId)

		if (card == null) {
			Logger.logger.warn(`Card ${cardId} not found when creating a profile for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Card ${cardId} not found when creating a profile for account ${accountId}`)
		}

		if (card.profile != null) {
			Logger.logger.warn(`Account's ${accountId} card ${cardId} already has a profile`)
			throw new ResourceAlreadyExistsError(`Account's ${accountId} card ${cardId} already has a profile`)
		}

		profile.photo = undefined
		profile.vCard = undefined
		profile.links = undefined
		profile.theme = ProfileTheme.Golden

		const profileDoc = ProfileDbModel.convertToDbModel(profile)
		card.profile = profileDoc

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account '${accountId}' when adding a profile for card ${cardId}`, err)
			throw new DatabaseError(`Failed to save account '${accountId}' when adding a profile for card ${cardId}`)
		}

		return ProfileDbModel.convertToDomainModel(card.profile)
	}

	public static async updateForAccountForCard(accountId: string, cardId: string, profile: Profile): Promise<Profile> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when updating profile ${profile.id} for card ${cardId}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when updating profile ${profile.id} for card ${cardId}`)
		}

		const card = accountDoc.cards?.find(c => (c as unknown as Document).id == cardId)

		if (card == null) {
			Logger.logger.warn(`Card ${cardId} not found when updating profile ${profile.id} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Card ${cardId} not found when updating profile ${profile.id} for account ${accountId}`)
		}

		if (card.profile == null || (card.profile as unknown as Document).id != profile.id) {
			Logger.logger.warn(`Profile ${profile.id} not found when attempting to update it for card ${cardId} for account ${accountDoc.id}`)
			throw new ReferencedResourceNotFoundError(`Profile ${profile.id} not found when attempting to update it for card ${cardId} for account ${accountDoc.id}`)
		}

		card.profile.name = profile.name
		card.profile.surname = profile.surname
		card.profile.title = profile.title
		card.profile.location = profile.location
		card.profile.description = profile.description

		try {
			accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account ${accountId} when updating profile ${profile.id} for card ${cardId}`, err)
			throw new DatabaseError(`Failed to save account ${accountId} when updating profile ${profile.id} for card ${cardId}`)
		}

		return ProfileDbModel.convertToDomainModel(card.profile)
	}

	public static async updateForAccount(accountId: string, profile: Profile): Promise<Profile> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when updating profile ${profile.id}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when updating profile ${profile.id}`)
		}

		if (accountDoc.profile == null || (accountDoc.profile as unknown as Document).id != profile.id) {
			Logger.logger.warn(`Profile ${profile.id} not found when attempting to update it for account ${accountDoc.id}`)
			throw new ReferencedResourceNotFoundError(`Profile ${profile.id} not found when attempting to update it for account ${accountDoc.id}`)
		}

		accountDoc.profile.name = profile.name
		accountDoc.profile.surname = profile.surname
		accountDoc.profile.title = profile.title
		accountDoc.profile.location = profile.location
		accountDoc.profile.description = profile.description

		try {
			accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account ${accountId} when updating profile ${profile.id}`, err)
			throw new DatabaseError(`Failed to save account ${accountId} when updating profile ${profile.id}`)
		}

		return ProfileDbModel.convertToDomainModel(accountDoc.profile)
	}

	public static async deleteForAccountForCard(accountId: string, cardId: string, profileId: string): Promise<void> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when deleting profile ${profileId} for card ${cardId}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when deleting profile ${profileId} for card ${cardId}`)
		}

		const card = accountDoc.cards?.find(c => (c as unknown as Document).id == cardId)

		if (card == null) {
			Logger.logger.warn(`Card ${cardId} not found when deleting profile ${profileId} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Card ${cardId} not found when deleting profile ${profileId} for account ${accountId}`)
		}

		if ((card.profile as unknown as Document)?.id != profileId) {
			Logger.logger.warn(`Profile ${profileId} not found when attempting to delete it for card ${cardId} for account ${accountDoc.id}`)
			throw new ReferencedResourceNotFoundError(`Profile ${profileId} not found when attempting to delete it for card ${cardId} for account ${accountDoc.id}`)
		}

		if (card.profile?.photo != null) {
			ProfilePhotoService.removeFile(accountId, cardId, profileId, `${process.env.PROFILE_PHOTOS_DIR}/${card.profile?.photo.fileName}.jpeg`,
				"when deleting profile")
		}

		card.profile = undefined

		try {
			accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account ${accountId} when deleting profile ${profileId} for card ${cardId}`, err)
			throw new DatabaseError(`Failed to save account ${accountId} when deleting profile ${profileId} for card ${cardId}`)
		}
	}

	public static async deleteForAccount(accountId: string, profileId: string): Promise<void> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when deleting its profile ${profileId}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when deleting its profile ${profileId}`)
		}

		if ((accountDoc.profile as unknown as Document)?.id != profileId) {
			Logger.logger.warn(`Profile ${profileId} not found when attempting to delete it for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Profile ${profileId} not found when attempting to delete it for account ${accountId}`)
		}

		if (accountDoc.profile?.photo != null) {
			ProfilePhotoService.removeFile(accountId, null, profileId, `${process.env.PROFILE_PHOTOS_DIR}/${accountDoc.profile?.photo.fileName}.jpeg`,
				"when deleting profile")
		}

		accountDoc.profile = undefined

		try {
			accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account ${accountId} when deleting its profile ${profileId}`, err)
			throw new DatabaseError(`Failed to save account ${accountId} when deleting its profile ${profileId}`)
		}
	}

}