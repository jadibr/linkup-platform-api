import { CustomLinkType } from "./custom-link-type"
import { ProfileLinkType } from "./enums/profile-link-type"

export class ProfileLink {

	constructor(
			public id: string | undefined | null,
			public linkType: ProfileLinkType | undefined | null,
			public name: string | undefined | null,
			public value: string | undefined | null,
			public orderNumber: number | undefined | null,
			public customLinkType: CustomLinkType | undefined | null) {}
}