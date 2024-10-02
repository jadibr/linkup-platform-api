import bcrypt from 'bcrypt'
import { Document } from "mongoose"

import { Account } from './types/account'
import { Card } from './types/card'
import { CustomLinkType } from './types/custom-link-type'
import { Profile } from './types/profile'
import { ProfileLink } from './types/profile-link'
import { ProfilePhoto } from './types/profile-photo'

import { VCard } from './types/vcard'
import { ProfileLinkType } from './types/enums/profile-link-type'
import { ProfileTheme } from './types/enums/profile-theme'
import { AccountDbModel } from './db-models/account.db-model'
import { ICustomLinkType } from './db-models/custom-link-type.db-model'


export abstract class DbSeeder {


	public static async seedDatabase() {
		const account = new Account(
			null,
			"LinkUp",
			"Karen",
			"+56912345678",
			"info@linkup.digital",
			"12345678",
			true,
			false,
			new Profile(
				null,
				"LinkUp",
				null,
				"Terjetas digitales",
				null,
				"Vendemos tarjetas de presentacion digital.",
				null,
				new VCard(
					null,
					"LinkUp",
					null,
					"LinkUp",
					"+56912345678",
					"+56987654321",
					"info@linkup.digital",
					"https://linkup.direct"
				),
				[
					new ProfileLink(
						null,
						ProfileLinkType.Website,
						"Nuestra pagina",
						"https://linkup.direct",
						1,
						null
					),
					new ProfileLink(
						null,
						ProfileLinkType.Mail,
						"Correo",
						"escribeme.linkup@gmail.com",
						2,
						null
					)
				],
				ProfileTheme.Golden
			),
			[
				new Card(
					null,
					"Jake's card",
					new Profile(
						null,
						"Jake",
						"Zwi",
						"Desarrollador",
						"Santiago, Chile",
						null,
						null,
						null,
						[
							new ProfileLink(
								null,
								ProfileLinkType.Whatsapp,
								"Whatsapp",
								"+56912345678",
								1,
								null
							),
							new ProfileLink(
								null,
								ProfileLinkType.Custom,
								"Calendly",
								"https://calendly.com/jake",
								2,
								new CustomLinkType(
									"644956661c2f3a3c3d0258c0",
									null)
							)
						],
						ProfileTheme.Golden
					),
					true,
					false
				),
				new Card(
					null,
					"Tarjeta de Karen",
					new Profile(
						null,
						"Karen",
						null,
						"Economista",
						"Santiago",
						"Hola, soy Karen",
						null,
						new VCard(
							null,
							"Karen",
							"Manriquez",
							"LinkUp",
							"+56912345678",
							"+56987654321",
							"karen@mail.com",
							"https://karen.com"
						),
						[
							new ProfileLink(
								null,
								ProfileLinkType.Website,
								"Mi pagina",
								"https://karen.com",
								1,
								null
							),
							new ProfileLink(
								null,
								ProfileLinkType.Whatsapp,
								"Whatsapp",
								"+56987654321",
								2,
								null
							),
							new ProfileLink(
								null,
								ProfileLinkType.Instagram,
								"Instagram",
								"https://instagram.com/karen",
								3,
								null
							),
							new ProfileLink(
								null,
								ProfileLinkType.Mail,
								"Correo",
								"karen@gmail.com",
								4,
								null
							),
							new ProfileLink(
								null,
								ProfileLinkType.Map,
								"Mi ubicación",
								"https://maps.google.com/karen",
								5,
								null
							),
							new ProfileLink(
								null,
								ProfileLinkType.Facebook,
								"Facebook",
								"https://facebook.com/karen",
								6,
								null
							),
							new ProfileLink(
								null,
								ProfileLinkType.YouTube,
								"Youtube",
								"https://youtube.com/karen",
								7,
								null
							),
							new ProfileLink(
								null,
								ProfileLinkType.Twitter,
								"Twitter",
								"https://twitter.com/karen",
								8,
								null
							),
							new ProfileLink(
								null,
								ProfileLinkType.LinkedIn,
								"LinkedIn",
								"https://www.linkedin.com/in/barackobama/",
								9,
								null
							),
							new ProfileLink(
								null,
								ProfileLinkType.Custom,
								"Reservar una reunión conmigo",
								"https://calendly.com/karen",
								10,
								new CustomLinkType(
									"644956661c2f3a3c3d0258c0",
									null)
							),
							new ProfileLink(
								null,
								ProfileLinkType.Custom,
								"Paga en linea",
								"https://santander.com/karen",
								11,
								new CustomLinkType(
									"644956661c2f3a3c3d0258c1",
									null)
							)
						],
						ProfileTheme.Golden
					),
					true,
					false
				)
			],
			[
				new CustomLinkType(null, "Calendly"),
				new CustomLinkType(null, "Payment")]
		)

		const accountDoc = AccountDbModel.convertToDbModel(account)

		const l1 = accountDoc.cards?.at(1)?.profile?.links?.at(9)
		const l2 = accountDoc.cards?.at(1)?.profile?.links?.at(10)

		if (l1 != null) {
			l1.customLinkTypeId = (accountDoc.customProfileLinkTypes?.at(0) as ICustomLinkType & Document)?.id
		}
		if (l2 != null) {
			l2.customLinkTypeId = (accountDoc.customProfileLinkTypes?.at(1) as ICustomLinkType & Document)?.id
		}

		await accountDoc.save()
	}
}