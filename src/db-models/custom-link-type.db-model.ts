import { Schema, Document } from "mongoose"

import { CustomLinkType } from "../types/custom-link-type"


export abstract class CustomLinkTypeDbModel {
	public static customLinkTypeSchema = new Schema({
		name: String
	})

	public static convertToDbModel(customLinkType: CustomLinkType): ICustomLinkType {
		return {
			name: customLinkType.name == null ?
				undefined :
				customLinkType.name
		}
	}

	public static convertToDomainModel(customLinkTypeDoc: ICustomLinkType): CustomLinkType {
		return new CustomLinkType(
			(customLinkTypeDoc as ICustomLinkType & Document).id,
			customLinkTypeDoc.name == null ?
				undefined :
				customLinkTypeDoc.name
		)
	}

}

export interface ICustomLinkType {
	name: string | undefined | null
}