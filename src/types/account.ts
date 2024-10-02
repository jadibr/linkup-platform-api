import { Card } from "./card"
import { CustomLinkType } from "./custom-link-type"
import { Profile } from "./profile"


export class Account {

	constructor(
			public id: string | undefined | null,
			public name: string | undefined | null,
			public contactName: string | undefined | null,
			public phone: string | undefined | null,
			public email: string | undefined | null,
			public password: string | undefined | null,
			public isActive: boolean | undefined | null,
			public isDisabled: boolean | undefined | null,
			public profile: Profile | undefined | null,
			public cards: Card[] | undefined | null,
			public customProfileLinkTypes: CustomLinkType[] | undefined | null) {}

	public hasCustomProfileLinkTypes(): boolean {
		return this.customProfileLinkTypes != null &&
			this.customProfileLinkTypes.length > 0
	}

	public getProfile(profileId: string): Profile | undefined | null {
		if (this.profile?.id == profileId) {
			return this.profile
		}

		if (this.cards != null) {
			for (const card of this.cards) {
				if (card.profile?.id == profileId) {
					return card.profile
				}
			}
		}
		
		return null
	}

	public getProfileForCard(cardId: string): Profile | undefined | null {
		if (this.cards == null) {
			return null
		}
		return this.cards.find(c => c.id == cardId)?.profile
	}
}