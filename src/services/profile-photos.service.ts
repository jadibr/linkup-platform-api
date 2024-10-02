import fs from 'fs'
import formidable from "formidable"
import sharp from 'sharp'
import { Document, Types } from "mongoose"

import { ProfilePhoto } from "../types/profile-photo"
import { AccountService } from './account.service'
import { ReferencedResourceNotFoundError } from '../errors/referenced-resource-not-found.error'
import { ResourceAlreadyExistsError } from '../errors/resource-already-exists.error'
import { Logger } from '../logger'
import { ProfilePhotoDbModel } from '../db-models/profile-photo.db-model'
import { DatabaseError } from '../errors/database.error'


export abstract class ProfilePhotoService {

	public static async createForProfileForAccount(accountId: string, profileId: string, photo: formidable.File): Promise<ProfilePhoto> {

		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			ProfilePhotoService.removeFile(accountId, null, profileId, photo.filepath,
				"when adding profile photo")
			Logger.logger.warn(`Account ${accountId} not found when adding a photo for profile ${profileId}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when adding a photo for profile ${profileId}`)
		}

		if (accountDoc.profile == null || (accountDoc.profile as unknown as Document).id != profileId) {
			ProfilePhotoService.removeFile(accountId, null, profileId, photo.filepath,
				"when adding profile photo")
			Logger.logger.warn(`Profile ${profileId} not found when adding a photo for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Profile ${profileId} not found when adding a photo for account ${accountId}`)
		}

		if (accountDoc.profile.photo != null) {
			ProfilePhotoService.removeFile(accountId, null, profileId, photo.filepath,
				"when adding profile photo")
			Logger.logger.warn(`Account's ${accountId} profile ${profileId} already has a photo`)
			throw new ResourceAlreadyExistsError(`Account's ${accountId} profile ${profileId} already has a photo`)
		}
		
		const profilePhotoDoc = ProfilePhotoDbModel.convertToDbModel(new ProfilePhoto(null, null))
		accountDoc.profile.photo = profilePhotoDoc

		try {
			await accountDoc.save()
		} catch (err) {
			ProfilePhotoService.removeFile(accountId, null, profileId, photo.filepath,
				"when adding profile photo")
			Logger.logger.error(`Failed to save account '${accountId}' when adding a photo for profile ${profileId}`, err)
			throw new DatabaseError(`Failed to save account '${accountId}' when adding a photo for profile ${profileId}`)
		}

		try {
			await sharp(photo.filepath)
				.jpeg({quality: 60})
				.toFile(`${process.env.PROFILE_PHOTOS_DIR}/${accountDoc.profile.photo.fileName}.jpeg`)
		} catch (err) {
			ProfilePhotoService.removeFile(accountId, null, profileId, photo.filepath,
				"when adding profile photo")
			Logger.logger.error(`Failed to compress profile photo '${photo.filepath}' when adding photo ${(accountDoc.profile.photo as unknown as Document).id} for profile ${profileId} for account ${accountId}`, err)
			throw new Error(`Failed to compress profile photo '${photo.filepath}' when adding photo ${(accountDoc.profile.photo as unknown as Document).id} for profile ${profileId} for account ${accountId}`)
		}

		ProfilePhotoService.removeFile(accountId, null, profileId, photo.filepath, "when adding profile photo")

		return ProfilePhotoDbModel.convertToDomainModel(accountDoc.profile.photo)

	}

	public static async createForProfileForCardForAccount(accountId: string, cardId: string, profileId: string, photo: formidable.File): Promise<ProfilePhoto> {

		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			ProfilePhotoService.removeFile(accountId, cardId, profileId, photo.filepath,
				"when adding profile photo")
			Logger.logger.warn(`Account ${accountId} not found when adding a photo for profile ${profileId} for card ${cardId}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when adding a photo for profile ${profileId} for card ${cardId}`)
		}

		const card =  accountDoc.cards?.find(c => (c as unknown as Document).id == cardId)

		if (card == null) {
			ProfilePhotoService.removeFile(accountId, cardId, profileId, photo.filepath,
				"when adding profile photo")
			Logger.logger.warn(`Card ${cardId} not found when adding a photo for profile ${profileId} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Card ${cardId} not found when adding a photo for profile ${profileId} for account ${accountId}`)
		}

		if (card.profile == null || (card.profile as unknown as Document).id != profileId) {
			ProfilePhotoService.removeFile(accountId, cardId, profileId, photo.filepath,
				"when adding profile photo")
			Logger.logger.warn(`Profile ${profileId} not found when adding a photo for card ${cardId} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Profile ${profileId} not found when adding a photo for card ${cardId} for account ${accountId}`)
		}

		if (card.profile.photo != null) {
			ProfilePhotoService.removeFile(accountId, cardId, profileId, photo.filepath,
				"when adding profile photo")
			Logger.logger.warn(`Account's ${accountId} card's ${cardId} profile ${profileId} already has a photo`)
			throw new ResourceAlreadyExistsError(`Account's ${accountId} card's ${cardId} profile ${profileId} already has a photo`)
		}
		
		const profilePhotoDoc = ProfilePhotoDbModel.convertToDbModel(new ProfilePhoto(null, null))
		card.profile.photo = profilePhotoDoc

		try {
			await accountDoc.save()
		} catch (err) {
			ProfilePhotoService.removeFile(accountId, cardId, profileId, photo.filepath,
				"when adding profile photo")
			Logger.logger.error(`Failed to save account '${accountId}' when adding a photo for profile ${profileId} for card ${cardId}`, err)
			throw new DatabaseError(`Failed to save account '${accountId}' when adding a photo for profile ${profileId} for card ${cardId}`)
		}

		try {
			await sharp(photo.filepath)
				.jpeg({quality: 60})
				.toFile(`${process.env.PROFILE_PHOTOS_DIR}/${card.profile.photo.fileName}.jpeg`)
		} catch (err) {
			ProfilePhotoService.removeFile(accountId, cardId, profileId, photo.filepath,
				"when adding profile photo")
			Logger.logger.error(`Failed to compress profile photo '${photo.filepath}' when adding photo ${(card.profile.photo as unknown as Document).id} for profile ${profileId} for card ${cardId} for account ${accountId}`, err)
			throw new Error(`Failed to compress profile photo '${photo.filepath}' when adding photo ${(card.profile.photo as unknown as Document).id} for profile ${profileId} for card ${cardId} for account ${accountId}`)
		}

		ProfilePhotoService.removeFile(accountId, cardId, profileId, photo.filepath, "when adding profile photo")

		return ProfilePhotoDbModel.convertToDomainModel(card.profile.photo)

	}

	public static async updateForProfileForAccount(accountId: string, profileId: string, photoId: string, photo: formidable.File): Promise<ProfilePhoto> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			ProfilePhotoService.removeFile(accountId, null, profileId, photo.filepath,
				"when updating profile photo")
			Logger.logger.warn(`Account ${accountId} not found when updating photo ${photoId} for profile ${profileId}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when updating photo ${photoId} for profile ${profileId}`)
		}

		if (accountDoc.profile == null || (accountDoc.profile as unknown as Document).id != profileId) {
			ProfilePhotoService.removeFile(accountId, null, profileId, photo.filepath,
				"when updating profile photo")
			Logger.logger.warn(`Profile ${profileId} not found when updating photo ${photoId} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Profile ${profileId} not found when updating photo ${photoId} for account ${accountId}`)
		}

		const profilePhotoDoc = accountDoc.profile.photo

		if (profilePhotoDoc == null || (profilePhotoDoc as unknown as Document).id != photoId) {
			ProfilePhotoService.removeFile(accountId, null, profileId, photo.filepath,
				"when updating profile photo")
			Logger.logger.warn(`Photo ${photoId} not found when updating it for profile ${profileId} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Photo ${photoId} not found when updating it for profile ${profileId} for account ${accountId}`)
		}

		ProfilePhotoService.removeFile(accountId, null, profileId, `${process.env.PROFILE_PHOTOS_DIR}/${profilePhotoDoc.fileName}.jpeg`,
			"when updating profile photo")

		profilePhotoDoc.fileName = (new Types.ObjectId()).toString()

		try {
			await accountDoc.save()
		} catch (err) {
			ProfilePhotoService.removeFile(accountId, null, profileId, photo.filepath,
				"when updating profile photo")
			Logger.logger.error(`Failed to save account '${accountId}' when updating photo ${photoId} for profile ${profileId}`, err)
			throw new DatabaseError(`Failed to save account '${accountId}' when updating photo ${photoId} for profile ${profileId}`)
		}

		try {
			await sharp(photo.filepath)
				.jpeg({quality: 60})
				.toFile(`${process.env.PROFILE_PHOTOS_DIR}/${profilePhotoDoc.fileName}.jpeg`)
		} catch (err) {
			ProfilePhotoService.removeFile(accountId, null, profileId, photo.filepath,
				"when updating profile photo")
			Logger.logger.error(`Failed to compress profile photo '${photo.filepath}' when updating photo ${photoId} for profile ${profileId} for account ${accountId}`, err)
			throw new Error(`Failed to compress profile photo '${photo.filepath}' when updating photo ${photoId} for profile ${profileId} for account ${accountId}`)
		}

		ProfilePhotoService.removeFile(accountId, null, profileId, photo.filepath, "when updating profile photo")

		return ProfilePhotoDbModel.convertToDomainModel(profilePhotoDoc)
	}

	public static async updateForProfileForCardForAccount(accountId: string, cardId: string, profileId: string, photoId: string, photo: formidable.File): Promise<ProfilePhoto> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			ProfilePhotoService.removeFile(accountId, cardId, profileId, photo.filepath,
				"when updating profile photo")
			Logger.logger.warn(`Account ${accountId} not found when updating photo ${photoId} for profile ${profileId} for card ${cardId}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when updating photo ${photoId} for profile ${profileId} for card ${cardId}`)
		}

		const card =  accountDoc.cards?.find(c => (c as unknown as Document).id == cardId)

		if (card == null) {
			ProfilePhotoService.removeFile(accountId, cardId, profileId, photo.filepath,
				"when updating profile photo")
			Logger.logger.warn(`Card ${cardId} not found when updating a photo for profile ${profileId} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Card ${cardId} not found when updating a photo for profile ${profileId} for account ${accountId}`)
		}

		if (card.profile == null || (card.profile as unknown as Document).id != profileId) {
			ProfilePhotoService.removeFile(accountId, cardId, profileId, photo.filepath,
				"when updating profile photo")
			Logger.logger.warn(`Profile ${profileId} not found when updating photo ${photoId} for card ${cardId} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Profile ${profileId} not found when updating photo ${photoId} for card ${cardId} for account ${accountId}`)
		}

		const profilePhotoDoc = card.profile.photo

		if (profilePhotoDoc == null || (profilePhotoDoc as unknown as Document).id != photoId) {
			ProfilePhotoService.removeFile(accountId, cardId, profileId, photo.filepath,
				"when updating profile photo")
			Logger.logger.warn(`Photo ${photoId} not found when updating it for profile ${profileId} for card ${cardId} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Photo ${photoId} not found when updating it for profile ${profileId} for card ${cardId} for account ${accountId}`)
		}

		ProfilePhotoService.removeFile(accountId, cardId, profileId, `${process.env.PROFILE_PHOTOS_DIR}/${profilePhotoDoc.fileName}.jpeg`,
			"when updating profile photo")

		profilePhotoDoc.fileName = (new Types.ObjectId()).toString()

		try {
			await accountDoc.save()
		} catch (err) {
			ProfilePhotoService.removeFile(accountId, cardId, profileId, photo.filepath,
				"when updating profile photo")
			Logger.logger.error(`Failed to save account '${accountId}' when updating photo ${photoId} for profile ${profileId} for card ${cardId}`, err)
			throw new DatabaseError(`Failed to save account '${accountId}' when updating photo ${photoId} for profile ${profileId} for card ${cardId}`)
		}

		try {
			await sharp(photo.filepath)
				.jpeg({quality: 60})
				.toFile(`${process.env.PROFILE_PHOTOS_DIR}/${profilePhotoDoc.fileName}.jpeg`)
		} catch (err) {
			ProfilePhotoService.removeFile(accountId, cardId, profileId, photo.filepath,
				"when updating profile photo")
			Logger.logger.error(`Failed to compress profile photo '${photo.filepath}' when updating photo ${photoId} for profile ${profileId} for card ${cardId} for account ${accountId}`, err)
			throw new Error(`Failed to compress profile photo '${photo.filepath}' when updating photo ${photoId} for profile ${profileId} for card ${cardId} for account ${accountId}`)
		}

		ProfilePhotoService.removeFile(accountId, cardId, profileId, photo.filepath, "when updating profile photo")

		return ProfilePhotoDbModel.convertToDomainModel(profilePhotoDoc)
	}

	public static async deleteForProfileForAccount(accountId: string, profileId: string, photoId: string): Promise<void> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when deleting photo ${photoId} for profile ${profileId}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when deleting photo ${photoId} for profile ${profileId}`)
		}

		if (accountDoc.profile == null || (accountDoc.profile as unknown as Document).id != profileId) {
			Logger.logger.warn(`Profile ${profileId} not found when deleting photo ${photoId} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Profile ${profileId} not found when deleting photo ${photoId} for account ${accountId}`)
		}

		if (accountDoc.profile.photo == null || (accountDoc.profile.photo as unknown as Document).id != photoId) {
			Logger.logger.warn(`Photo ${photoId} not found when deleting it for profile ${profileId} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Photo ${photoId} not found when deleting it for profile ${profileId} for account ${accountId}`)
		}

		ProfilePhotoService.removeFile(
			accountId, null, profileId, `${process.env.PROFILE_PHOTOS_DIR}/${accountDoc.profile.photo.fileName}.jpeg`,
			"wen deleting profile photo")

		accountDoc.profile.photo = undefined

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account '${accountId}' when deleting photo ${photoId} for profile ${profileId}`, err)
			throw new DatabaseError(`Failed to save account '${accountId}' when deleting photo ${photoId} for profile ${profileId}`)
		}
	}

	public static async deleteForProfileForCardForAccount(accountId: string, cardId: string, profileId: string, photoId: string): Promise<void> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when deleting photo ${photoId} for profile ${profileId} for card ${cardId}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when deleting photo ${photoId} for profile ${profileId} for card ${cardId}`)
		}

		const card =  accountDoc.cards?.find(c => (c as unknown as Document).id == cardId)

		if (card == null) {
			Logger.logger.warn(`Card ${cardId} not found when deleting a photo for profile ${profileId} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Card ${cardId} not found when deleting a photo for profile ${profileId} for account ${accountId}`)
		}

		if (card.profile == null || (card.profile as unknown as Document).id != profileId) {
			Logger.logger.warn(`Profile ${profileId} not found when deleting photo ${photoId} for account ${accountId} for card ${cardId}`)
			throw new ReferencedResourceNotFoundError(`Profile ${profileId} not found when deleting photo ${photoId} for account ${accountId} for card ${cardId}`)
		}

		if (card.profile.photo == null || (card.profile.photo as unknown as Document).id != photoId) {
			Logger.logger.warn(`Photo ${photoId} not found when deleting it for profile ${profileId} for card ${cardId} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Photo ${photoId} not found when deleting it for profile ${profileId} for card ${cardId} for account ${accountId}`)
		}

		ProfilePhotoService.removeFile(
			accountId, cardId, profileId, `${process.env.PROFILE_PHOTOS_DIR}/${card.profile.photo.fileName}.jpeg`,
			"wen deleting profile photo")

		card.profile.photo = undefined

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account '${accountId}' when deleting photo ${photoId} for profile ${profileId} for card ${cardId}`, err)
			throw new DatabaseError(`Failed to save account '${accountId}' when deleting photo ${photoId} for profile ${profileId} for card ${cardId}`)
		}
	}

	public static async removeFile(accountId: string, cardId: string | null, profileId: string, filePath: string, partialLogMessage: string): Promise<void> {
		try {
			await fs.promises.rm(filePath, { force: true })
		} catch (err) {
			Logger.logger.warn(`Failed to delete photo file ${filePath}${partialLogMessage == null ? '' : ' ' + partialLogMessage} for account ${accountId}${cardId == null ? '' : ' for card ' + cardId} for profile ${profileId}`)
		}
	}

}