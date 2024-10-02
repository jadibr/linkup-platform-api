import { Schema, Document, model } from "mongoose"

import { Account } from "../types/account"
import { IProfile, ProfileDbModel } from "./profile.db-model"
import { CardDbModel, ICard } from "./card.db-model"
import { CustomLinkTypeDbModel, ICustomLinkType } from "./custom-link-type.db-model"


export abstract class AccountDbModel {

	private static accountSchema = new Schema<IAccount>({
		name: String,
		contactName: String,
		phone: String,
		email: {
			type: String,
			unique: true
		},
		password: String,
		isActive: Boolean,
		isDisabled: Boolean,
		profile: ProfileDbModel.profileSchema,
		cards: [CardDbModel.cardSchema],
		customProfileLinkTypes: [CustomLinkTypeDbModel.customLinkTypeSchema],
		activationToken: new Schema({}),
		passwordResetToken: new Schema({}),
		emailUpdateToken: new Schema({
			email: String
		}),
	})

	public static AccountModel = model<IAccount>('account', AccountDbModel.accountSchema)

	public static convertToDbModel(account: Account): IAccount {
		return new AccountDbModel.AccountModel({
			name: account.name == null ?
				undefined :
				account.name,
			contactName: account.contactName == null ?
				undefined :
				account.contactName,
			phone: account.phone == null ?
				undefined :
				account.phone,
			email: account.email == null ?
				undefined :
				account.email,
			password: account.password == null ?
				undefined :
				account.password,
			isActive: account.isActive == null ?
				undefined :
				account.isActive,
			isDisabled: account.isDisabled == null ?
				undefined :
				account.isDisabled,
			profile: account.profile == null ?
				undefined :
				ProfileDbModel.convertToDbModel(account.profile),
			cards: account.cards == null ?
				undefined :
				account.cards.map(c => CardDbModel.convertToDbModel(c)),
			customProfileLinkTypes: account.customProfileLinkTypes == null ?
				undefined :
				account.customProfileLinkTypes.map(cplt => CustomLinkTypeDbModel.convertToDbModel(cplt)),
		})
	}
	

	public static convertToDomainModel(accountDoc: IAccount): Account {
		const account = new Account(
			accountDoc.id,
			accountDoc.name == null ? 
				undefined :
				accountDoc.name,
			accountDoc.contactName == null ? 
				undefined :
				accountDoc.contactName,
			accountDoc.phone == null ? 
				undefined :
				accountDoc.phone,
			accountDoc.email == null ? 
				undefined :
				accountDoc.email,
			accountDoc.password == null ? 
				undefined :
				accountDoc.password,
			accountDoc.isActive == null ? 
				undefined :
				accountDoc.isActive,
			accountDoc.isDisabled == null ? 
				undefined :
				accountDoc.isDisabled,
			accountDoc.profile == null ? 
				undefined :
				ProfileDbModel.convertToDomainModel(accountDoc.profile),
			accountDoc.cards == null ? 
				undefined :
				accountDoc.cards.map(c => CardDbModel.convertToDomainModel(c)),
			accountDoc.customProfileLinkTypes == null ? 
				undefined :
				accountDoc.customProfileLinkTypes.map(cplt => CustomLinkTypeDbModel.convertToDomainModel(cplt)),
		)
		delete account.password
		return account
	}
}

export interface IAccount extends Document {
	name: string | undefined | null
	contactName: string | undefined | null
	phone: string | undefined | null
	email: string | undefined | null
	password: string | undefined | null
	isActive: boolean | undefined | null
	isDisabled: boolean | undefined | null
	profile: IProfile | undefined | null
	cards: ICard[] | undefined | null
	customProfileLinkTypes: ICustomLinkType[] | undefined | null
	activationToken: Object | undefined
	passwordResetToken: Object | undefined
	emailUpdateToken: Object | undefined
}