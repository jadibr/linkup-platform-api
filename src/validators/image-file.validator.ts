import path from 'path'
import { Request } from "express"
import formidable from "formidable"

import { Logger } from "../logger"
import { ProfilePhotoService } from "../services/profile-photos.service"


export abstract class ImageFileValidator {

	private static allowedMimeTypes = ['image/jpeg', 'image/png']
	private static allowedFileExtensions = ['jpg', 'jpeg', 'png']

	public static async parseAndValidateImageFile(accountId: string, cardId: string | null, profileId: string, req: Request): Promise<formidable.File | null> {

		const form = formidable({
			maxFileSize: 5 * 1024 * 1024,
			maxFiles: 1,
			maxFields: 0
		})
		let parsedForm: [formidable.Fields<string>, formidable.Files<string>]

		try {
			parsedForm = await form.parse(req)
		} catch (err) {
			Logger.logger.warn(`Failed to parse profile photo file for account ${accountId}${cardId == null ? '' : ' for card ' + cardId} for profile ${profileId}.`, err)
			return null
		}

		const files = parsedForm[1].profilePhoto

		if (files == null || files.length < 1) {
			return null
		}

		const profilePhoto = files[0]
		if (profilePhoto.mimetype == null || profilePhoto.originalFilename == null ||
				!ImageFileValidator.allowedMimeTypes.some(amt => amt == profilePhoto.mimetype) ||
				!ImageFileValidator.allowedFileExtensions.some(fe => profilePhoto.originalFilename != null &&
					fe == path.extname(profilePhoto.originalFilename).replace('.', '').toLowerCase())) {
			ProfilePhotoService.removeFile(accountId, cardId, profileId, profilePhoto.filepath, "when validating profile photo")
			return null
		}

		return profilePhoto
	}

}