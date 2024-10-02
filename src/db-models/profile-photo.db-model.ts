import { Schema, Document, Types } from "mongoose"

import { ProfilePhoto } from "../types/profile-photo"


export abstract class ProfilePhotoDbModel {
	public static profilePhotoSchema = new Schema({
		fileName: String
	})

	public static convertToDbModel(profilePhoto: ProfilePhoto): IProfilePhoto {
		return {
			fileName: profilePhoto.fileName == null ?
				(new Types.ObjectId()).toString() :
				profilePhoto.fileName
		}
	}

	public static convertToDomainModel(profilePhotoDoc: IProfilePhoto): ProfilePhoto {
		return new ProfilePhoto(
			(profilePhotoDoc as IProfilePhoto & Document).id,
			profilePhotoDoc.fileName == null ?
				undefined :
				profilePhotoDoc.fileName
		)
	}

}

export interface IProfilePhoto {
	fileName: string | undefined | null
}