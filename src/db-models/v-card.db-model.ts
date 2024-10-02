import { Schema, Document } from "mongoose"

import { VCard } from "../types/vcard"


export abstract class VCardDbModel {
	public static vCardSchema = new Schema({
		name: String,
		surname: String,
		organization: String,
		workPhone: String,
		homePhone: String,
		email: String,
		websiteUrl: String,
	})

	public static convertToDbModel(vCard: VCard): IVCard {
		return {
			name: vCard.name == null ?
				undefined :
				vCard.name,
			surname: vCard.surname == null ?
				undefined :
				vCard.surname,
			organization: vCard.organization == null ?
				undefined :
				vCard.organization,
			workPhone: vCard.workPhone == null ?
				undefined :
				vCard.workPhone,
			homePhone: vCard.homePhone == null ?
				undefined :
				vCard.homePhone,
			email: vCard.email == null ?
				undefined :
				vCard.email,
			websiteUrl: vCard.websiteUrl == null ?
				undefined :
				vCard.websiteUrl,
		}
	}

	public static convertToDomainModel(vCardDoc: IVCard): VCard {
		return new VCard(
			(vCardDoc as IVCard & Document).id,
			vCardDoc.name,
			vCardDoc.surname == null ?
				undefined :
				vCardDoc.surname,
			vCardDoc.organization == null ?
				undefined :
				vCardDoc.organization,
			vCardDoc.workPhone == null ?
				undefined :
				vCardDoc.workPhone,
			vCardDoc.homePhone == null ?
				undefined :
				vCardDoc.homePhone,
			vCardDoc.email == null ?
				undefined :
				vCardDoc.email,
			vCardDoc.websiteUrl == null ?
				undefined :
				vCardDoc.websiteUrl)
	}
}

export interface IVCard {
	name: string | undefined | null
	surname: string | undefined | null
	organization: string | undefined | null
	workPhone: string | undefined | null
	homePhone: string | undefined | null
	email: string | undefined | null
	websiteUrl: string | undefined | null
}