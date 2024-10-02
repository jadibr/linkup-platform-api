import { Document, Types } from "mongoose"

import { AccountService } from "./account.service"
import { Logger } from "../logger"
import { ReferencedResourceNotFoundError } from "../errors/referenced-resource-not-found.error"
import { DatabaseError } from "../errors/database.error"
import { ProfileLink } from "../types/profile-link"
import { IProfileLink, ProfileLinkDbModel } from "../db-models/profile-link.db-model"
import { ProfileLinkType } from "../types/enums/profile-link-type"


export abstract class ProfileLinkService {

	public static async createForProfileForAccount(accountId: string, profileId: string, link: ProfileLink): Promise<ProfileLink> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when creating a profile link for profile ${profileId}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when creating a profile link for profile ${profileId}`)
		}

		if (accountDoc.profile == null || (accountDoc.profile as unknown as Document).id != profileId) {
			Logger.logger.warn(`Profile ${profileId} not found when creating a profile link for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Profile ${profileId} not found when creating a profile link for account ${accountId}`)
		}

		if (link.customLinkType != null && !accountDoc.customProfileLinkTypes?.some(clt => (clt as unknown as Document).id == link.customLinkType?.id)) {
			Logger.logger.warn(`Custom link type ${link.customLinkType.id} not found when creating a profile link for Profile ${profileId} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Custom link type ${link.customLinkType.id} not found when creating a profile link for Profile ${profileId} for account ${accountId}`)
		}

		if (link.linkType != ProfileLinkType.Custom) {
			link.customLinkType = undefined
		}

		ProfileLinkService.updateLinksOrderNumbersForNewLink(accountDoc.profile.links, link)

		const profileLinkDoc = (accountDoc.profile.links as Types.DocumentArray<IProfileLink>).create(ProfileLinkDbModel.convertToDbModel(link))
		accountDoc.profile.links?.push(profileLinkDoc)

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account '${accountId}' when creating a profile link for profile ${profileId}`, err)
			throw new DatabaseError(`Failed to save account '${accountId}' when creating a profile link for profile ${profileId}`)
		}

		return ProfileLinkDbModel.convertToDomainModel(profileLinkDoc)
	}

	public static async createForProfileForCardForAccount(accountId: string, cardId: string, profileId: string, link: ProfileLink): Promise<ProfileLink> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when creating a profile link for card ${cardId} for profile ${profileId}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when creating a profile link for card ${cardId} for profile ${profileId}`)
		}

		const card =  accountDoc.cards?.find(c => (c as unknown as Document).id == cardId)

		if (card == null) {
			Logger.logger.warn(`Card ${cardId} not found when creating a profile link for account ${accountId} for profile ${profileId}`)
			throw new ReferencedResourceNotFoundError(`Card ${cardId} not found when creating a profile link for account ${accountId} for profile ${profileId}`)
		}

		if (card.profile == null || (card.profile as unknown as Document).id != profileId) {
			Logger.logger.warn(`Profile ${profileId} not found when creating a profile link for account ${accountId} for card ${cardId}`)
			throw new ReferencedResourceNotFoundError(`Profile ${profileId} not found when creating a profile link for account ${accountId} for card ${cardId}`)
		}

		if (link.customLinkType != null && !accountDoc.customProfileLinkTypes?.some(clt => (clt as unknown as Document).id == link.customLinkType?.id)) {
			Logger.logger.warn(`Custom link type ${link.customLinkType.id} not found when creating a profile link for Profile ${profileId} for account ${accountId} for card ${cardId}`)
			throw new ReferencedResourceNotFoundError(`Custom link type ${link.customLinkType.id} not found when creating a profile link for Profile ${profileId} for account ${accountId} for card ${cardId}`)
		}

		if (link.linkType != ProfileLinkType.Custom) {
			link.customLinkType = undefined
		}

		ProfileLinkService.updateLinksOrderNumbersForNewLink(card.profile.links, link)

		const profileLinkDoc = (card.profile.links as Types.DocumentArray<IProfileLink>).create(ProfileLinkDbModel.convertToDbModel(link))
		card.profile.links?.push(profileLinkDoc)

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account '${accountId}' when adding a profile link for card ${cardId} for profle ${profileId}`, err)
			throw new DatabaseError(`Failed to save account '${accountId}' when adding a profile link for card ${cardId} for profle ${profileId}`)
		}

		return ProfileLinkDbModel.convertToDomainModel(profileLinkDoc)
	}

	public static async updateForProfileForAccount(accountId: string, profileId: string, link: ProfileLink): Promise<ProfileLink> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when updating profile link ${link.id} for profile ${profileId}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when updating profile link ${link.id} for profile ${profileId}`)
		}

		if (accountDoc.profile == null || (accountDoc.profile as unknown as Document).id != profileId) {
			Logger.logger.warn(`Profile ${profileId} not found when updating profile link ${link.id} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Profile ${profileId} not found when updating profile link ${link.id} for account ${accountId}`)
		}

		if (link.customLinkType != null && !accountDoc.customProfileLinkTypes?.some(clt => (clt as unknown as Document).id == link.customLinkType?.id)) {
			Logger.logger.warn(`Custom link type ${link.customLinkType.id} not found when updating profile link ${link.id} for Profile ${profileId} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Custom link type ${link.customLinkType.id} not found when updating profile link ${link.id} for Profile ${profileId} for account ${accountId}`)
		}

		const profileLinkDoc = accountDoc.profile.links?.find(pl => (pl as unknown as Document).id == link.id)

		if (accountDoc.profile.links == null || profileLinkDoc == null) {
			Logger.logger.warn(`Profile link ${link.id} not found when attempting to update it for Profile ${profileId} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Profile link ${link.id} not found when attempting to update it for Profile ${profileId} for account ${accountId}`)
		}

		ProfileLinkService.updateLinksOrderNumbersForUpdatedLink(accountDoc.profile.links as Types.DocumentArray<IProfileLink>, profileLinkDoc, link)

		profileLinkDoc.linkType = link.linkType
		profileLinkDoc.name = link.name
		profileLinkDoc.value = link.value
		profileLinkDoc.orderNumber = link.orderNumber
		profileLinkDoc.customLinkTypeId = link.linkType != ProfileLinkType.Custom ?
			undefined :
			link.customLinkType?.id

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account '${accountId}' when updating profile link ${link.id} for profile ${profileId}`, err)
			throw new DatabaseError(`Failed to save account '${accountId}' when updating profile link ${link.id} for profile ${profileId}`)
		}

		return ProfileLinkDbModel.convertToDomainModel(profileLinkDoc)
	}

	public static async updateForProfileForCardForAccount(accountId: string, cardId: string, profileId: string, link: ProfileLink): Promise<ProfileLink> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when updating profile link ${link.id} for card ${cardId} for profile ${profileId}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when updating profile link ${link.id} for card ${cardId} for profile ${profileId}`)
		}

		const card =  accountDoc.cards?.find(c => (c as unknown as Document).id == cardId)

		if (card == null) {
			Logger.logger.warn(`Card ${cardId} not found when updating profile link ${link.id} for account ${accountId} for profile ${profileId}`)
			throw new ReferencedResourceNotFoundError(`Card ${cardId} not found when updating profile link ${link.id} for account ${accountId} for profile ${profileId}`)
		}

		if (card.profile == null || (card.profile as unknown as Document).id != profileId) {
			Logger.logger.warn(`Profile ${profileId} not found when updating profile link ${link.id} for account ${accountId} for card ${cardId}`)
			throw new ReferencedResourceNotFoundError(`Profile ${profileId} not found when updating profile link ${link.id} for account ${accountId} for card ${cardId}`)
		}

		if (link.customLinkType != null && !accountDoc.customProfileLinkTypes?.some(clt => (clt as unknown as Document).id == link.customLinkType?.id)) {
			Logger.logger.warn(`Custom link type ${link.customLinkType.id} not found when updating profile link ${link.id} for Profile ${profileId} for account ${accountId} for card ${cardId}`)
			throw new ReferencedResourceNotFoundError(`Custom link type ${link.customLinkType.id} not found when updating profile link ${link.id} for Profile ${profileId} for account ${accountId} for card ${cardId}`)
		}

		const profileLinkDoc = card.profile.links?.find(pl => (pl as unknown as Document).id == link.id)

		if (card.profile.links == null || profileLinkDoc == null) {
			Logger.logger.warn(`Profile link ${link.id} not found when attempting to update it for Profile ${profileId} for account ${accountId} for card ${cardId}`)
			throw new ReferencedResourceNotFoundError(`Profile link ${link.id} not found when attempting to update it for Profile ${profileId} for account ${accountId} for card ${cardId}`)
		}

		ProfileLinkService.updateLinksOrderNumbersForUpdatedLink(card.profile.links as Types.DocumentArray<IProfileLink>, profileLinkDoc, link)

		profileLinkDoc.linkType = link.linkType
		profileLinkDoc.name = link.name
		profileLinkDoc.value = link.value
		profileLinkDoc.orderNumber = link.orderNumber
		profileLinkDoc.customLinkTypeId = link.linkType != ProfileLinkType.Custom ?
			undefined :
			link.customLinkType?.id

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account '${accountId}' when updating profile link ${link.id} for card ${cardId} for profle ${profileId}`, err)
			throw new DatabaseError(`Failed to save account '${accountId}' when updating profile link ${link.id} for card ${cardId} for profle ${profileId}`)
		}

		return ProfileLinkDbModel.convertToDomainModel(profileLinkDoc)
	}

	public static async deleteForProfileForAccount(accountId: string, profileId: string, linkId: string): Promise<void> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when deleting profile link ${linkId} for profile ${profileId}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when deleting profile link ${linkId} for profile ${profileId}`)
		}

		if (accountDoc.profile == null || (accountDoc.profile as unknown as Document).id != profileId) {
			Logger.logger.warn(`Profile ${profileId} not found when deleting profile link ${linkId} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Profile ${profileId} not found when deleting profile link ${linkId} for account ${accountId}`)
		}

		const profileLinkDoc = accountDoc.profile.links?.find(pl => (pl as unknown as Document).id == linkId)

		if (accountDoc.profile.links == null || profileLinkDoc == null) {
			Logger.logger.warn(`Profile link ${linkId} not found when attempting to delete it for Profile ${profileId} for account ${accountId}`)
			throw new ReferencedResourceNotFoundError(`Profile link ${linkId} not found when attempting to delete it for Profile ${profileId} for account ${accountId}`)
		}

		(profileLinkDoc as unknown as Types.ArraySubdocument).deleteOne()
		ProfileLinkService.updateLinksOrderNumbersForDeletedLink(accountDoc.profile.links, profileLinkDoc)

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account '${accountId}' when deleting profile link ${linkId} for profile ${profileId}`, err)
			throw new DatabaseError(`Failed to save account '${accountId}' when deleting profile link ${linkId} for profile ${profileId}`)
		}
	}

	public static async deleteForProfileForCardForAccount(accountId: string, cardId: string, profileId: string, linkId: string): Promise<void> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when deleting profile link ${linkId} for card ${cardId} for profile ${profileId}`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when deleting profile link ${linkId} for card ${cardId} for profile ${profileId}`)
		}

		const card =  accountDoc.cards?.find(c => (c as unknown as Document).id == cardId)

		if (card == null) {
			Logger.logger.warn(`Card ${cardId} not found when deleting profile link ${linkId} for account ${accountId} for profile ${profileId}`)
			throw new ReferencedResourceNotFoundError(`Card ${cardId} not found when deleting profile link ${linkId} for account ${accountId} for profile ${profileId}`)
		}

		if (card.profile == null || (card.profile as unknown as Document).id != profileId) {
			Logger.logger.warn(`Profile ${profileId} not found when deleting profile link ${linkId} for account ${accountId} for card ${cardId}`)
			throw new ReferencedResourceNotFoundError(`Profile ${profileId} not found when deleting profile link ${linkId} for account ${accountId} for card ${cardId}`)
		}

		const profileLinkDoc = card.profile.links?.find(pl => (pl as unknown as Document).id == linkId)

		if (card.profile.links == null || profileLinkDoc == null) {
			Logger.logger.warn(`Profile link ${linkId} not found when attempting to delete it for Profile ${profileId} for account ${accountId} for card ${cardId}`)
			throw new ReferencedResourceNotFoundError(`Profile link ${linkId} not found when attempting to delete it for Profile ${profileId} for account ${accountId} for card ${cardId}`)
		}

		(profileLinkDoc as unknown as Types.ArraySubdocument).deleteOne()
		ProfileLinkService.updateLinksOrderNumbersForDeletedLink(card.profile.links, profileLinkDoc)

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account '${accountId}' when deleting profile link ${linkId} for card ${cardId} for profle ${profileId}`, err)
			throw new DatabaseError(`Failed to save account '${accountId}' when deleting profile link ${linkId} for card ${cardId} for profle ${profileId}`)
		}
	}

	private static updateLinksOrderNumbersForNewLink(profileLinks: IProfileLink[] | undefined | null, link: ProfileLink): void {		
		if (profileLinks == null || profileLinks.length == 0) {
			link.orderNumber = 1
			return
		}

		if (link.orderNumber != null && link.orderNumber > profileLinks.length + 1) {
			link.orderNumber = profileLinks.length + 1
		}

		const linksToBeUpdated = profileLinks.filter(l => link.orderNumber != null && l.orderNumber != null && l.orderNumber >= link.orderNumber)
		for (const link of linksToBeUpdated) {
			if (link.orderNumber == null) {
				continue
			}
			link.orderNumber++
		}
	}

	private static updateLinksOrderNumbersForUpdatedLink(profileLinks: Types.DocumentArray<IProfileLink>, currentLink: IProfileLink, updatedLink: ProfileLink): void {
		if (updatedLink.orderNumber == null || currentLink.orderNumber == null ||
				currentLink.orderNumber == updatedLink.orderNumber) {
			return
		}

		if (updatedLink.orderNumber != null && updatedLink.orderNumber > profileLinks.length) {
			updatedLink.orderNumber = profileLinks.length
		}

		const lowerToHigherUpdate = currentLink.orderNumber < updatedLink.orderNumber

		const linksToBeUpdated = lowerToHigherUpdate ?
			profileLinks.filter(l => l.orderNumber != null && currentLink.orderNumber != null && updatedLink.orderNumber != null &&
				l.orderNumber > currentLink.orderNumber && l.orderNumber <= updatedLink.orderNumber && l.id != currentLink.linkType) :
			profileLinks.filter(l => l.orderNumber != null && currentLink.orderNumber != null && updatedLink.orderNumber != null &&
				l.orderNumber >= updatedLink.orderNumber && l.orderNumber < currentLink.orderNumber && l.id != currentLink.linkType)

		for (const link of linksToBeUpdated) {
			if (link.orderNumber == null) {
				continue
			}
			lowerToHigherUpdate == true ?
				link.orderNumber-- :
				link.orderNumber++
		}
	}

	private static updateLinksOrderNumbersForDeletedLink(profileLinks: IProfileLink[], deletedLink: IProfileLink): void {
		const linksToBeUpdated = profileLinks.filter(l => deletedLink.orderNumber != null && l.orderNumber != null && l.orderNumber > deletedLink.orderNumber)

		for (const link of linksToBeUpdated) {
			if (link.orderNumber == null) {
				continue
			}
			link.orderNumber--
		}
	}

}