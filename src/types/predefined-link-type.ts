import { ProfileLinkType } from "./enums/profile-link-type"

export class PredefinedLinkType {

	constructor(
			public type: ProfileLinkType,
			public name: string,
			public iconName: string) {}
}
