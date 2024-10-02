import { Schema, Document } from "mongoose"

import { IVCard, VCardDbModel } from "./v-card.db-model"
import { IProfilePhoto, ProfilePhotoDbModel } from "./profile-photo.db-model"
import { IProfileLink, ProfileLinkDbModel } from "./profile-link.db-model"
import { ProfileTheme } from "../types/enums/profile-theme"
import { Profile } from "../types/profile"


export abstract class ProfileDbModel {
	public static profileSchema = new Schema({
		name: String,
		surname: String,
		title: String,
		location: String,
		description: String,
		photo: ProfilePhotoDbModel.profilePhotoSchema,
		vCard: VCardDbModel.vCardSchema,
		links: [ProfileLinkDbModel.ProfileLinkSchema],
		theme: {
			type: Number,
			enum: Object.values(ProfileTheme).filter(v => Number.isInteger(v))
		}
	})
		.index({ _id: 1 })

	public static convertToDbModel(profile: Profile): IProfile {
		return {
			name: profile.name == null ?
				undefined :
				profile.name,
			surname: profile.surname == null ?
				undefined :
				profile.surname,
			title: profile.title == null ?
				undefined :
				profile.title,
			location: profile.location == null ?
				undefined :
				profile.location,
			description: profile.description == null ?
				undefined :
				profile.description,
			photo: profile.photo == null ?
				undefined :
				ProfilePhotoDbModel.convertToDbModel(
					profile.photo
				),
			vCard: profile.vCard == null ?
				undefined :
				VCardDbModel.convertToDbModel(profile.vCard),
			links: profile.links == null ?
				undefined :
				profile.links.map(l => ProfileLinkDbModel.convertToDbModel(l)),
			theme: profile.theme == null ?
				undefined :
				profile.theme
		}
	}

	public static convertToDomainModel(profileDoc: IProfile): Profile {
		return new Profile(
			(profileDoc as IProfile & Document).id,
			profileDoc.name == null ?
				undefined :
				profileDoc.name,
			profileDoc.surname == null ?
				undefined :
				profileDoc.surname,
			profileDoc.title == null ?
				undefined :
				profileDoc.title,
			profileDoc.location == null ?
				undefined :
				profileDoc.location,
			profileDoc.description == null ?
				undefined :
				profileDoc.description,
			profileDoc.photo == null ?
				undefined :
				ProfilePhotoDbModel.convertToDomainModel(profileDoc.photo),
			profileDoc.vCard == null ?
				undefined :
				VCardDbModel.convertToDomainModel(profileDoc.vCard),
			profileDoc.links == null ?
				undefined :
				profileDoc.links.map(l => ProfileLinkDbModel.convertToDomainModel(l)),
			profileDoc.theme == null ?
				undefined :
				profileDoc.theme as ProfileTheme
		)
	}

}

export interface IProfile {
	name: string | undefined | null
	surname: string | undefined | null
	title: string | undefined | null
	location: string | undefined | null
	description: string | undefined | null
	photo: IProfilePhoto | undefined | null
	vCard: IVCard | undefined | null
	links: IProfileLink[] | undefined | null
	theme: number | undefined | null
}