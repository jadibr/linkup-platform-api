import { Profile } from "./profile"

export class Card {

	constructor(
			public id: string | undefined | null,
			public name: string | undefined | null,
			public profile: Profile | undefined | null,
			public isActive: boolean | undefined | null,
			public isDisabled: boolean | undefined | null) {}
}