import { Schema, Document } from "mongoose"

import { ProfileLink } from "../types/profile-link"
import { ProfileLinkType } from "../types/enums/profile-link-type"
import { CustomLinkType } from "../types/custom-link-type"


export abstract class ProfileLinkDbModel {
	public static ProfileLinkSchema = new Schema({
		linkType: {
			type: Number,
			enum: Object.values(ProfileLinkType).filter(v => Number.isInteger(v))
		},
		name: String,
		value: String,
		orderNumber: Number,
		customLinkTypeId: String
	})

	public static convertToDbModel(profileLink: ProfileLink): IProfileLink {
		return {
			linkType: profileLink.linkType == null ?
				undefined :
				profileLink.linkType,
			name: profileLink.name == null ?
				undefined :
				profileLink.name,
			value: profileLink.value == null ?
				undefined :
				profileLink.value,
			orderNumber: profileLink.orderNumber == null ?
				undefined :
				profileLink.orderNumber,
			customLinkTypeId: profileLink.customLinkType == null ?
				undefined :
				profileLink.customLinkType.id,
		}
	}

	public static convertToDomainModel(profileLinkDoc: IProfileLink): ProfileLink {
		return new ProfileLink(
			(profileLinkDoc as IProfileLink & Document).id,
			profileLinkDoc.linkType == null ?
				undefined :
				profileLinkDoc.linkType as ProfileLinkType,
			profileLinkDoc.name == null ?
				undefined :
				profileLinkDoc.name,
			profileLinkDoc.value == null ?
				undefined :
				profileLinkDoc.value,
			profileLinkDoc.orderNumber == null ?
				undefined :
				profileLinkDoc.orderNumber,
			profileLinkDoc.customLinkTypeId == null ?
				undefined :
				new CustomLinkType(
					profileLinkDoc.customLinkTypeId,
					undefined
				)
		)
	}

}

export interface IProfileLink {
	linkType: ProfileLinkType | undefined | null
	name: string | undefined | null
	value: string | undefined | null
	orderNumber: number | undefined | null
	customLinkTypeId: string | undefined | null
}