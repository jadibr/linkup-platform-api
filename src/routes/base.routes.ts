import { Router } from "express"
import { AccountsRoutes } from "./accounts.routes"

import { AuthMiddleware } from "../middleware/auth.middleware"
import { AuthenticateRoutes } from "./authenticate.routes"
import { ActivateAccountRoutes } from "./activate-account.routes"
import { PasswordResetRoutes } from "./password-reset.routes"
import { RefreshTokenRoutes } from "./refresh-token.routes"
import { EmailUpdateRoutes } from "./email-update.routes"
import { ProfilesRoutes } from "./profiles.routes"
import { AccountCardProfilesRoutes } from "./account-card-profiles.routes"
import { AccountCardsRoutes } from "./account-cards.routes"
import { AccountProfilesRoutes } from "./account-profiles.routes"
import { AccountCardProfileVCardsRoutes } from "./account-card-profile-vcards.routes"
import { AccountProfileVCardsRoutes } from "./account-profile-vcards.routes"
import { AccountCustomLinkTypesRoutes } from "./account-custom-link-types.routes"
import { AccountCardProfileLinksRoutes } from "./account-card-profile-links.routes"
import { AccountProfileLinksRoutes } from "./account-profile-links.routes"
import { AccountProfilePhotosRoutes } from "./account-profile-photos.routes"
import { ProfilePhotosRoutes } from "./profile-photos.routes"
import { AccountCardProfilePhotosRoutes } from "./account-card-profile-photos.routes"


export abstract class BaseRoutes {
	public static basePath = '/api'

	public static addChildRoutes(): Router {
		const router = Router()
		BaseRoutes.addRoutes(router)
		return router
	}

	private static addRoutes(router: Router): void {
		router.use(AuthenticateRoutes.authenticatePath, AuthenticateRoutes.addAuthenticateRoutes())
		router.use(RefreshTokenRoutes.refreshTokenPath, RefreshTokenRoutes.addRefreshTokenRoutes())
		router.use(PasswordResetRoutes.passwordResetPath, PasswordResetRoutes.addPasswordResetRoutes())
		router.use(ActivateAccountRoutes.activateAccountPath, ActivateAccountRoutes.addActivateAccountRoutes())
		router.use(EmailUpdateRoutes.emailUpdatePath, AuthMiddleware.getAuthFunction(false), EmailUpdateRoutes.addEmailUpdateRoutes())
		router.use(ProfilePhotosRoutes.profilePhotosPath, ProfilePhotosRoutes.addProfilePhotosRoutes())
		router.use(AccountsRoutes.accountsPath, AuthMiddleware.getAuthFunction(false), AccountsRoutes.addBusinessesRoutes())
		router.use(ProfilesRoutes.profilesPath, ProfilesRoutes.addProfilesRoutes())
		router.use(AccountCardProfilePhotosRoutes.accountCardProfilePhotosPath, AuthMiddleware.getAuthFunction(), AccountCardProfilePhotosRoutes.addAccountCardProfilePhotosRoutes())
		router.use(AccountProfilePhotosRoutes.accountProfilePhotosPath, AuthMiddleware.getAuthFunction(), AccountProfilePhotosRoutes.addAccountProfilePhotosRoutes())
		router.use(AccountCardProfileVCardsRoutes.accountCardProfileVCardsPath, AuthMiddleware.getAuthFunction(), AccountCardProfileVCardsRoutes.addAccountCardProfileVCardsRoutes())
		router.use(AccountProfileVCardsRoutes.accountProfileVCardsPath, AuthMiddleware.getAuthFunction(), AccountProfileVCardsRoutes.addAccountProfileVCardsRoutes())
		router.use(AccountCustomLinkTypesRoutes.accountCustomLinkTypesPath, AuthMiddleware.getAuthFunction(), AccountCustomLinkTypesRoutes.addAccountCustomLinkTypesRoutes())
		router.use(AccountCardProfileLinksRoutes.accountCardProfileLinksPath, AuthMiddleware.getAuthFunction(), AccountCardProfileLinksRoutes.addAccountCardProfileLinksRoutes())
		router.use(AccountProfileLinksRoutes.accountProfileLinksPath, AuthMiddleware.getAuthFunction(), AccountProfileLinksRoutes.addAccountProfileLinksRoutes())
		router.use(AccountProfilesRoutes.accountProfilesPath, AuthMiddleware.getAuthFunction(), AccountProfilesRoutes.addAccountProfilesRoutes())
		router.use(AccountCardsRoutes.accountCardsPath, AuthMiddleware.getAuthFunction(), AccountCardsRoutes.addAccountCardsRoutes())
		router.use(AccountCardProfilesRoutes.accountCardProfilesPath, AuthMiddleware.getAuthFunction(), AccountCardProfilesRoutes.addAccountCardProfilesRoutes())
	}
}