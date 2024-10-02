import { Document } from "mongoose"
import mongoose from "mongoose"
import bcrypt from "bcrypt"

import { CardDbModel, ICard } from "./db-models/card.db-model"
import { Card } from "./types/card"
import { Logger } from "./logger"
import { AccountService } from "./services/account.service"
import { Account } from "./types/account"
import { Profile } from "./types/profile"
import { VCard } from "./types/vcard"
import { ProfileLink } from "./types/profile-link"
import { ProfileLinkType } from "./types/enums/profile-link-type"
import { ProfileTheme } from "./types/enums/profile-theme"
import { AccountDbModel, IAccount } from "./db-models/account.db-model"
import { CustomLinkType } from "./types/custom-link-type"
import { IProfileLink } from "./db-models/profile-link.db-model"
import { ProfileDbModel } from "./db-models/profile.db-model"


async function connectToDb(): Promise<mongoose.Mongoose> {
	const runningInDevelopment = process.env.NODE_ENV?.toLowerCase() == 'development'
	const connectionScheme = runningInDevelopment ? 'mongodb' : 'mongodb+srv'

	try {
		return await mongoose.connect(
			// `${connectionScheme}://linkup-api:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URL}/linkup`,
			`mongodb://linkup-api:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URL}/linkup`,
			{
				connectTimeoutMS: 5000,
				// authSource: runningInDevelopment ? undefined : 'admin',
				// replicaSet: runningInDevelopment ? undefined : process.env.MONGO_REPL_SET,
				// tls: runningInDevelopment ? false : true
			})
	} catch (err) {
		console.error(`Could not connect to: ${process.env.MONGO_URL}`, err)
		process.exit(1)
	}
}

async function addCard(accountId: string): Promise<void> {

	await connectToDb()
	Logger.initializeLogger()

	const accountDoc = await AccountService.getAccountDocById(accountId)

	if (accountDoc == null) {
		Logger.logger.error(`Account ${accountId} was not found when adding a card`)
		return
	}

	const card = new Card(
		undefined,
		"Jake's primary card",
		undefined,
		true,
		false
	)
	const cardDoc = (accountDoc.cards as mongoose.Types.DocumentArray<ICard>)
		.create(CardDbModel.convertToDbModel(card))
	accountDoc.cards?.push(cardDoc)

	try {
		await accountDoc.save()
	} catch (err) {
		Logger.logger.error(`Failed to create a card for account ${accountId}`)
		return
	}

	Logger.logger.info(`Added a card ${cardDoc.id} for account ${accountId}`)
}

async function addAccount(account: Account): Promise<void> {
	await connectToDb()
	Logger.initializeLogger()

	if (account.password == null) {
		Logger.logger.error(`Account's '${account.email}' password is null`)
		return
	}

	account.password = await hashPassword(account.password)

	const accountDoc = AccountDbModel.convertToDbModel(account)

	updateCustomLinksTypesIds(accountDoc) //

	try {
		await accountDoc.save()
	} catch (err) {
		Logger.logger.error(`Failed to create account (email: '${account.email}')`, err)
		return
	}
	Logger.logger.info(`Successfully created account for email '${account.email}'`)
}

async function addAccountProfile(accountId: string, profile: Profile): Promise<void> {
	await connectToDb()
	Logger.initializeLogger()

	let accountDoc: IAccount | null

	try {
		accountDoc = await AccountDbModel.AccountModel.findById(accountId)
	} catch (err) {
		Logger.logger.error(`Failed to retrieve account ${accountId}`)
		return
	}

	if (accountDoc == null) {
		Logger.logger.error(`Account ${accountId} doesn't exist`)
		return
	}

	if (accountDoc.profile != null) {
		Logger.logger.error(`Account ${accountId} already has a profile`)
		return
	}

	const profileDoc = ProfileDbModel.convertToDbModel(buildProfile())
	accountDoc.profile = profileDoc

	try {
		await accountDoc.save()
	} catch (err) {
		Logger.logger.error(`Failed to save account ${accountId} while adding a profile`)
		return
	}

	Logger.logger.info(`Successfully created profile for account ${accountId}`)
}

function buildAccountOfZapateriaLastarria(): Account {
	return new Account(
		null,
		"Zapateria Lastarria",
		null,
		"+56232529749",
		"store@zapaterialastarria.cl",
		"87654321",
		true,
		false,
		null,
		[
			new Card(
				null,
				"Tarjeta de negocio principal",
				new Profile(
					null,
					"Zapateria Lastarria",
					null,
					"Tienda de zapatos",
					"Las Urbinas 23 local 36, Santiago",
					"Somos zapateros del país más austral del mundo. Combinamos el romanticismo de hacer un zapato a mano, con la búsqueda de un Santiago Cosmopolita.",
					null,
					new VCard(
						null,
						"Zapateria Lastarria",
						null,
						"Zapateria Lastarria",
						"+56232529749",
						null,
						"store@zapaterialastarria.cl",
						"https://zapaterialastarria.cl"
					),
					[
						new ProfileLink(null, ProfileLinkType.Website, "Nuestra pagina", "https://zapaterialastarria.cl", 1, null),
						new ProfileLink(null, ProfileLinkType.Map, "Ubicación", "https://goo.gl/maps/n311uw2KkiFQUyit5", 2, null),
						new ProfileLink(null, ProfileLinkType.Whatsapp, "Whatsapp", "+56933958023", 3, null),
						new ProfileLink(null, ProfileLinkType.Instagram, "Instagram", "https://www.instagram.com/zapaterialastarria", 4, null),
						new ProfileLink(null, ProfileLinkType.Facebook, "Facebook", "https://www.instagram.com/zapaterialastarria", 5, null),
						new ProfileLink(null, ProfileLinkType.Mail, "Correo", "store@zapaterialastarria.cl", 6, null),
						new ProfileLink(null, ProfileLinkType.YouTube, "YouTube", "https://youtu.be/WxOMdSWRhsA", 7, null),
					],
					ProfileTheme.Golden
				),
				true,
				false
			)
		],
		null
	)
}

function buildAccountOfFresenius(): Account {
	return new Account(
		null,
		"Fresenius Medical Care",
		"Javiera Rivas Isla",
		"+56226172100",
		"comunicaciones.chile@fmc-ag.com",
		"12345678",
		true,
		false,
		null,
		[
			new Card(
				null,
				"Tarjeta de Javiera",
				new Profile(
					null,
					"Javiera",
					"Rivas",
					"Product Manager de Fresenius Medical Care",
					"Av. Apoquindo 4501 ofic. 1004, Las Condes - Santiago, Chile.",
					"Fresenius Medical Care es parte del Grupo Fresenius, dedicado al cuidado de la salud en el mundo. Sus principales actividades se centran en la investigación, diseño, desarrollo, ingeniería y fabricación de productos para tratamientos médicos, así como en la prestación de servicios de salud preventivos y hospitalarios.",
					null,
					new VCard(
						null,
						"Javiera",
						"Rivas Isla",
						"Fresenius Medical Care",
						"+56953712965",
						null,
						"comunicaciones.chile@fmc-ag.com",
						"https://www.freseniusmedicalcare.cl"
					),
					[
						new ProfileLink(null, ProfileLinkType.Custom, "Felanpe", "https://felanpe2023.com", 1, new CustomLinkType(null, null)),
						new ProfileLink(null, ProfileLinkType.Custom, "Achinumet", "https://achinumet.cl/congreso2023", 2, new CustomLinkType(null, null)),
						new ProfileLink(null, ProfileLinkType.Custom, "ESPEN 2023", "https://espencongress.com", 3, new CustomLinkType(null, null)),
						new ProfileLink(null, ProfileLinkType.Custom, "ASPEN 2024", "https://www.nutritioncare.org/TGM-A23", 4, new CustomLinkType(null, null)),
						new ProfileLink(null, ProfileLinkType.Website, "Nuestra pagina", "https://www.freseniusmedicalcare.cl", 5, null),
						new ProfileLink(null, ProfileLinkType.Map, "Ubicación", "https://goo.gl/maps/zhorPZybUb5kWhX68", 6, null),
						new ProfileLink(null, ProfileLinkType.Whatsapp, "Whatsapp", "+56953712965", 7, null),
						new ProfileLink(null, ProfileLinkType.Instagram, "Instagram", "https://www.instagram.com/freseniusmedicalcarechile/", 8, null),
						new ProfileLink(null, ProfileLinkType.Facebook, "Facebook", "https://web.facebook.com/pages/Fresenius-Medical-Care-Chile/1905716406144248", 9, null),
						new ProfileLink(null, ProfileLinkType.Mail, "Correo", "comunicaciones.chile@fmc-ag.com", 10, null),
						new ProfileLink(null, ProfileLinkType.YouTube, "YouTube", "https://www.youtube.com/user/freseniusmedicare", 11, null),
						new ProfileLink(null, ProfileLinkType.LinkedIn, "LinkedIn", "https://www.linkedin.com/in/javiera-rivas-isla-566ba821b", 12, null),
					],
					ProfileTheme.Blue_Fresenius
				),
				true,
				false
			)
		],
		[
			new CustomLinkType(null, "Congreso")
		]
	)
}

function buildAccountOfMau(): Account {
	return new Account(
		null,
		"Dra Mau M",
		"Mau",
		"+56955230952",
		"maurietchmanriquez@gmail.com",
		"12345678",
		true,
		false,
		null,
		[
			new Card(
				null,
				"Tarjeta de Mau",
				new Profile(
					null,
					"Mau",
					"Manríquez",
					"Médico Nutrióloga",
					null,
					"Formación de Especialidad Médica  en Nutrición Clínica y MSc en Nutrición, Universidad De Chile.",
					null,
					new VCard(
						null,
						"Mau",
						"Manríquez",
						null,
						null,
						"+56955230952",
						"maurietchmanriquez@gmail.com",
						null
					),
					[
						new ProfileLink(null, ProfileLinkType.Whatsapp, "Whatsapp", "+56955230952", 1, null),
						new ProfileLink(null, ProfileLinkType.Instagram, "Instagram", "https://www.instagram.com/nutriologa_mau_m", 2, null),
						new ProfileLink(null, ProfileLinkType.Mail, "Correo", "maurietchmanriquez@gmail.com", 3, null),
					],
					ProfileTheme.Golden
				),
				true,
				false
			)
		],
		null
	)
}

function buildProfile(): Profile {
	return new Profile(
		null,
		"name",
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		ProfileTheme.Golden
	)
}

async function hashPassword(password: string): Promise<string> {
	try {
		return await bcrypt.hash(password, 11)
	} catch (err) {
		Logger.logger.error(`Failed to hash password ${password}`, err)
		throw Error(`Failed to hash password ${password}`)
	}
}

function updateCustomLinksTypesIds(accountDoc: IAccount): void {

	if (accountDoc.customProfileLinkTypes?.length == 0) {
		return
	}

	const customLinkTypeId = (accountDoc.customProfileLinkTypes?.at(0) as unknown as Document).id

	const customLinks: IProfileLink[] = []
	if (accountDoc.profile?.links != null) {
		customLinks.push(...accountDoc.profile.links.filter(l => l.linkType == ProfileLinkType.Custom))
	}

	if (accountDoc.cards != null) {
		for (const card of accountDoc.cards) {
			if (card.profile?.links != null) {
				customLinks.push(...card.profile.links.filter(l => l.linkType == ProfileLinkType.Custom))
			}
		}
	}

	for (const customLink of customLinks) {
		customLink.customLinkTypeId = customLinkTypeId
	}
}

(async () => {
	// console.log(await hashPassword('password1'))

	// await addCard("65395d4a1200dd9cad508501")
	// await addAccount(buildAccountOfMau())
})()