import { static as static_, Router, Response, NextFunction } from "express"


export abstract class ProfilePhotosRoutes {
	public static profilePhotosPath = "/profile-photos"

	public static addProfilePhotosRoutes(): Router {
		const router = Router()
		ProfilePhotosRoutes.addRoutes(router)
		return router
	}

	private static addRoutes(router: Router): void {
		router.get('/:filename',
			(req, res, next) => { ProfilePhotosRoutes.addCrossOriginResourcePolicyHeaderIfNotInProd(res, next) },
			static_(process.env.PROFILE_PHOTOS_DIR as string))
	}

	private static addCrossOriginResourcePolicyHeaderIfNotInProd(res: Response, next: NextFunction): void {
		if (process.env.NODE_ENV == 'production') {
			next()
			return
		}
		res.setHeader('Cross-Origin-Resource-Policy', 'same-site')
		next()
	}

}