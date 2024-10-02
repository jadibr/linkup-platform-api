import { Schema, Document, model } from "mongoose"

import { IProfile, ProfileDbModel } from "./profile.db-model"
import { Card } from "../types/card"


export abstract class CardDbModel {
	public static cardSchema = new Schema({
		name: String,
		profile: ProfileDbModel.profileSchema,
		isActive: Boolean,
		isDisabled: Boolean
	})
		.index({ _id: 1 })

	public static convertToDbModel(card: Card): ICard {
		return {
			name: card.name == null ?
				undefined :
				card.name,
			profile: card.profile == null ?
				undefined :
				ProfileDbModel.convertToDbModel(card.profile),
			isActive: card.isActive == null ?
				undefined :
				card.isActive,
			isDisabled: card.isDisabled == null ?
				undefined :
				card.isDisabled,
		}
	}

	public static convertToDomainModel(cardDoc: ICard): Card {
		return new Card(
			(cardDoc as ICard & Document).id,
			cardDoc.name == null ?
				undefined :
				cardDoc.name,
			cardDoc.profile == null ?
				undefined :
				ProfileDbModel.convertToDomainModel(cardDoc.profile),
			cardDoc.isActive == null ?
				undefined :
				cardDoc.isActive,
			cardDoc.isDisabled == null ?
				undefined :
				cardDoc.isDisabled
		)
	}
}

export interface ICard {
	name: string | undefined | null
	profile: IProfile | undefined | null
	isActive: boolean | undefined | null
	isDisabled: boolean | undefined | null
}