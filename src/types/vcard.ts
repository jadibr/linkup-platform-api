export class VCard {

	constructor(
			public id: string | undefined | null,
			public name: string | undefined | null,
			public surname: string | undefined | null,
			public organization: string | undefined | null,
			public workPhone: string | undefined | null,
			public homePhone: string | undefined | null,
			public email: string | undefined | null,
			public websiteUrl: string | undefined | null) {}
}