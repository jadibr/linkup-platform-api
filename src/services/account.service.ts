import bcrypt from "bcrypt"
import { Document } from "mongoose"

import { AccountDbModel, IAccount } from "../db-models/account.db-model"
import { BadRequestError } from "../errors/bad-request.error"
import { DatabaseError } from "../errors/database.error"
import { ResourceAlreadyExistsError } from "../errors/resource-already-exists.error"
import { Logger } from "../logger"
import { Account } from "../types/account"
import { ReferencedResourceNotFoundError } from "../errors/referenced-resource-not-found.error"
import { EmailService } from "./email.service"


export abstract class AccountService {

	public static async getByEmail(email: string): Promise<IAccount | null> {
		let accountDoc: IAccount | null

		try {
			accountDoc = await AccountDbModel.AccountModel.findOne({ email: email.toLowerCase(), activationToken: undefined, isDisabled: false }).exec()
		} catch (err) {
			Logger.logger.error(`Failed to get account by e-mail '${email}'`, err)
			throw new DatabaseError(`Failed to get account by e-mail '${email}'`)
		}

		return accountDoc
	}

	public static async getForCard(cardId: string): Promise<IAccount | null> {
		let accountDoc: IAccount | null

		try {
			accountDoc = await AccountDbModel.AccountModel.findOne(
				{ "cards._id": cardId },
				{ "cards._id": true, "cards.profile": true })
					.exec()
		} catch (err) {
			Logger.logger.error(`Failed to get account for card ${cardId}`, err)
			throw new DatabaseError(`Failed to get account for card ${cardId}`)
		}

		return accountDoc
	}

	public static async getForProfile(profileId: string): Promise<IAccount | null> {
		let accountDoc: IAccount | null

		try {
			accountDoc = await AccountDbModel.AccountModel.findOne(
				{ $or: [{"profile._id": profileId}, {"cards.profile._id": profileId}] },
				{ "profile": true, "cards.profile": true })
					.exec()
		} catch (err) {
			Logger.logger.error(`Failed to get account for profile ${profileId}`, err)
			throw new DatabaseError(`Failed to get account for profile ${profileId}`)
		}

		return accountDoc
	}

	public static async activateAccount(accountId: string, tokenId: string): Promise<void> {
		let accountDoc: IAccount | null

		try {
			accountDoc = await AccountDbModel.AccountModel.findById(accountId).exec()
		} catch (err) {
			Logger.logger.error(`Failed to retrieve account by id (${accountId})`, err)
			throw new DatabaseError(`Failed to retrieve account by id (${accountId})`)
		}

		if (accountDoc?.activationToken == null || (accountDoc.activationToken as Document).id != tokenId) {
			Logger.logger.warn(`Account ${accountId} or its account-activation token ${tokenId} doesn't exist`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} or its account-activation token ${tokenId} doesn't exist`)
		}

		accountDoc.activationToken = undefined

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to update account ${accountDoc.id} when activating account`, err)
			throw new DatabaseError(`Failed to update account ${accountDoc.id} when activating account`)
		}
	}

	public static async createPasswordResetToken(email: string): Promise<void> {
		const accountDoc = await AccountService.getByEmail(email)

		if (accountDoc == null) {
			return
		}

		accountDoc.passwordResetToken = new Object()

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account ${accountDoc.id} when creating password reset token`, err)
			throw new DatabaseError(`Failed to save account ${accountDoc.id} when creating password reset token`)
		}

		try {
			await EmailService.sendPasswordReset(accountDoc)
		} catch {}
	}

	public static async resetPassword(accountId: string, tokenId: string, newPassword: string): Promise<void> {
		let accountDoc

		accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc?.passwordResetToken == null || (accountDoc.passwordResetToken as Document).id != tokenId) {
			Logger.logger.warn(`Account ${accountId} or its password-reset token ${tokenId} doesn't exist`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} or its password-reset token ${tokenId} doesn't exist`)
		}

		const tokenExpiryDate = new Date((accountDoc.passwordResetToken as Document)._id.getTimestamp())
		tokenExpiryDate.setHours(tokenExpiryDate.getHours() + 1)

		if (tokenExpiryDate < new Date()) {

			accountDoc.passwordResetToken = undefined

			try {
				await accountDoc.save()
			} catch (err) {
				Logger.logger.error(`Failed to save account ${accountDoc.id} when removing password-reset token`, err)
				throw new DatabaseError(`Failed to save account ${accountDoc.id} when removing password-reset token`)
			}

			Logger.logger.warn(`Password reset token ${tokenId} for account ${accountId} is expired`)
			throw new ReferencedResourceNotFoundError(`Password reset token ${tokenId} for account ${accountId} is expired`)
		}

		try {
			accountDoc.password = await bcrypt.hash(newPassword, 11)
		} catch (err) {
			Logger.logger.error(`Failed to hash new password when resetting password for account ${accountId}`, err)
			throw Error(`Failed to hash new password when resetting password for account ${accountId}`)
		}

		accountDoc.passwordResetToken = undefined

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account ${accountDoc.id} when saving new password`, err)
			throw new DatabaseError(`Failed to save account ${accountDoc.id} when saving new password`)
		}
	}

	public static async createEmailUpdateToken(accountId: string, newEmail: string): Promise<void> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when creating email-update token`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when creating email-update token`)
		}

		if (accountDoc.email == newEmail.toLowerCase()) {
			Logger.logger.warn(`Cannot generate email-update token for current email, account ${accountId}`)
			throw new BadRequestError(`Cannot generate email-update token for current email, account ${accountId}`)
		}
		
		if (await AccountService.checkIfEmailIsAlreadyRegistered(newEmail) == true) {
			Logger.logger.warn(`Cannot generate email-update token for already registered email, account ${accountId}`)
			throw new ResourceAlreadyExistsError(`Cannot generate email-update token for already registered email, account ${accountId}`)
		}

		accountDoc.emailUpdateToken = {
			email: newEmail
		}

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account ${accountDoc.id} when creating email-update token`, err)
			throw new DatabaseError(`Failed to save account ${accountDoc.id} when creating email-update token`)
		}

		try {
			await EmailService.sendEmailUpdate(accountDoc, newEmail)
		} catch {}
	}

	public static async updateEmail(accountId: string, tokenId: string): Promise<void> {

		let accountDoc

		accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc?.emailUpdateToken == null || (accountDoc.emailUpdateToken as Document).id != tokenId) {
			Logger.logger.warn(`Account ${accountId} or its email-update token ${tokenId} doesn't exist`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} or its email-update token ${tokenId} doesn't exist`)
		}

		if (await AccountService.checkIfEmailIsAlreadyRegistered((accountDoc.emailUpdateToken as any).email) == true) {

			accountDoc.emailUpdateToken = undefined

			try {
				await accountDoc.save()
			} catch (err) {
				Logger.logger.error(`Failed to save account ${accountDoc.id} when removing email-update token for already registered email`, err)
				throw new DatabaseError(`Failed to save account ${accountDoc.id} when removing email-update token for already registered email`)
			}

			Logger.logger.warn(`Cannot update email to already registered one, account ${accountId}`)
			throw new ResourceAlreadyExistsError(`Cannot update email to already registered one, account ${accountId}`)
		}

		const tokenExpiryDate = new Date((accountDoc.emailUpdateToken as Document)._id.getTimestamp())
		tokenExpiryDate.setHours(tokenExpiryDate.getHours() + 1)

		if (tokenExpiryDate < new Date()) {

			accountDoc.emailUpdateToken = undefined

			try {
				await accountDoc.save()
			} catch (err) {
				Logger.logger.error(`Failed to save account ${accountDoc.id} when removing expired email-update token`, err)
				throw new DatabaseError(`Failed to save account ${accountDoc.id} when removing expired email-update token`)
			}

			Logger.logger.warn(`Email update token ${tokenId} for account ${accountId} is expired`)
			throw new ReferencedResourceNotFoundError(`Email update token ${tokenId} for account ${accountId} is expired`)
		}

		accountDoc.email = (accountDoc.emailUpdateToken as any).email
		accountDoc.emailUpdateToken = undefined

		try {
			await accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to save account ${accountDoc.id} when updating email`, err)
			throw new DatabaseError(`Failed to save account ${accountDoc.id} when updating email`)
		}
		
	}

	public static async getById(accountId: string): Promise<Account> {
		const accountDoc = await AccountService.getAccountDocById(accountId)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${accountId} not found when getting account by id`)
			throw new ReferencedResourceNotFoundError(`Account ${accountId} not found when getting account by id`)
		}

		return AccountDbModel.convertToDomainModel(accountDoc)
	}

	public static async create(account: Account): Promise<Account> {

		if (account.email == null ||
				account.password == null) {
			Logger.logger.warn(`Account with null required properties was submitted${account.email == null ? '' : ' (email: \''+ account.email + '\')'}`)
			throw new BadRequestError(`Account with null required properties was submitted${account.email == null ? '' : ' (email: \''+ account.email + '\')'}`)
		}
		
		if (await AccountService.checkIfEmailIsAlreadyRegistered(account.email) == true) {
			Logger.logger.warn(`Account with email: '${account.email}' already exists`)
			throw new ResourceAlreadyExistsError(`Account with email: '${account.email}' already exists`)
		}

		try {
			account.password = await bcrypt.hash(account.password, 11)
		} catch (err) {
			Logger.logger.error(`Failed to hash password when creating account (email: '${account.email}')`, err)
			throw Error(`Failed to hash password when creating a new account (email: '${account.email}')`)
		}

		account.isActive = true
		account.isDisabled = false
		account.profile = undefined
		account.cards = undefined
		account.customProfileLinkTypes = undefined

		const accountDoc = AccountDbModel.convertToDbModel(account)
		accountDoc.activationToken = new Object()

		try {
			await AccountDbModel.AccountModel.create(accountDoc)
		} catch (err) {
			Logger.logger.error(`Failed to create account (email: '${account.email}')`, err)
			throw new DatabaseError(`Failed to create account (email: '${account.email}')`)
		}

		try {
			await EmailService.sendAccountVerification(accountDoc)
		} catch {}

		return AccountDbModel.convertToDomainModel(accountDoc)
	}

	public static async update(account: Account): Promise<Account> {
		if (account.id == null) {
			throw new BadRequestError("Account ID is required")
		}

		const accountDoc = await AccountService.getAccountDocById(account.id)

		if (accountDoc == null) {
			Logger.logger.warn(`Account ${account.id} not found when updating account)`)
			throw new ReferencedResourceNotFoundError(`Account ${account.id} not found when updating account)`)
		}

		accountDoc.name = account.name
		accountDoc.contactName = account.contactName
		accountDoc.phone = account.phone
		accountDoc.isActive = account.isActive

		if (account.password != null) {
			try {
				accountDoc.password = await bcrypt.hash(account.password, 11)
			} catch (err) {
				Logger.logger.error(`Failed to hash new password when updating account ${accountDoc.id}`, err)
				throw Error(`Failed to hash new password when updating account ${accountDoc.id}`)
			}
		}

		try {
			accountDoc.save()
		} catch (err) {
			Logger.logger.error(`Failed to update account ${account.id}`, err)
			throw new DatabaseError(`Failed to update account ${account.id}`)
		}

		return AccountDbModel.convertToDomainModel(accountDoc)
	}

	public static async getAccountDocById(accountId: string): Promise<IAccount | null> {
		try {
			return await AccountDbModel.AccountModel.findOne({ _id: accountId, activationToken: undefined, isDisabled: false }).exec()
		} catch (err) {
			Logger.logger.error(`Failed to retrieve account by id (${accountId})`, err)
			throw new DatabaseError(`Failed to retrieve account by id (${accountId})`)
		}
	}

	private static async checkIfEmailIsAlreadyRegistered(email: string): Promise<boolean> {
		try {
			return await AccountDbModel.AccountModel.exists({ email: email.toLowerCase() }).exec() != null
		} catch (err) {
			Logger.logger.error(`Failed to check if account with email '${email}' exisits`, err)
			throw new DatabaseError(`Failed to check if account with email '${email}' exisits`)
		}
	}

}