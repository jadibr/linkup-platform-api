import { ProfileTheme } from "./enums/profile-theme"
import { ProfileLink } from "./profile-link"
import { ProfilePhoto } from "./profile-photo"
import { VCard } from "./vcard"


export class Profile {
	constructor(
			public id: string | undefined | null,
			public name: string | undefined | null,
			public surname: string | undefined | null,
			public title: string | undefined | null,
			public location: string | undefined | null,
			public description: string | undefined | null,
			public photo: ProfilePhoto | undefined | null,
			public vCard: VCard | undefined | null,
			public links: ProfileLink[] | undefined | null,
			public theme: ProfileTheme | undefined | null) {}
	
	public hasLinks(): boolean {
		return this.links != null &&
			this.links.length > 0
	}

	public getLinksHighestOrderNumber(): number {
		if (!this.hasLinks() || this.links == null) {
			return 0
		}
		let highestOrderNumber = 0

		for (const link of this.links) {
			if (link.orderNumber == null) {
				continue
			}
			if (link.orderNumber > highestOrderNumber) {
				highestOrderNumber = link.orderNumber
			}
		}
		return highestOrderNumber
	}

	public orderLinks(): void {
		if (!this.hasLinks()) {
			return
		}
		this.links?.sort((a, b) => this.sortLinks(a, b))
	}

	private sortLinks(a: ProfileLink, b: ProfileLink): number {
		if (a.orderNumber == null) {
			return 1
		}
		if (b.orderNumber == null) {
			return -1
		}
		return a.orderNumber - b.orderNumber
	}
}