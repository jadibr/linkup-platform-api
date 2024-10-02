import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { Credentials } from "../types/credentials"
import { Tokens } from "../types/tokens"
import { InvalidTokenError } from '../errors/invalid-token.error'
import { Logger } from '../logger'
import { AccountService } from './account.service'

export abstract class AuthenticationService {
	
	public static async authenticate(credentials: Credentials): Promise<Tokens | null> {
		const accountDoc = await AccountService.getByEmail(credentials.email)

		if (accountDoc?.password == null) {
			return null
		}

		try {
			if (await bcrypt.compare(credentials.password, accountDoc.password) == false) {
				return null
			}
		} catch (err) {
			Logger.logger.error(`Failed to compare passwords (email: '${credentials.email}')`, err)
			throw new Error(`Failed to compare passwords (email: '${credentials.email}')`)
		}

		try {
			return await AuthenticationService.generateTokens(accountDoc.id)
		} catch (err) {
			Logger.logger.error(`Failed to generate tokens (email: '${credentials.email}')`, err)
			throw new Error(`Failed to generate tokens (email: '${credentials.email}')`)
		}
	}

	public static async refreshToken(token: string): Promise<Tokens> {
		let payload: object
		try {
			payload = await AuthenticationService.getTokenPayload(token, false)
		} catch (err) {
			Logger.logger.error("Invalid refresh token", err)
			throw new InvalidTokenError("Invalid refresh token")
		}

		const accountId: string = (payload as any).sub

		try {
			await AccountService.getById(accountId)
		} catch (err) {
			Logger.logger.warn(`Cannot refresh token - account ${accountId} does not exist`)
			throw new InvalidTokenError(`Cannot refresh token - account ${accountId} does not exist`)
		}

		let tokens

		try {
			tokens = await AuthenticationService.generateToken(accountId)
		} catch (err) {
			Logger.logger.error("Failed to generate refresh token", err)
			throw new Error("Failed to generate refresh token")
		}

		delete tokens.refreshToken
		return tokens
	}

	public static async getAccountIdFromAccessToken(token: string): Promise<string | null> {
		let payload
		try {
			payload = await AuthenticationService.getTokenPayload(token, true)
		} catch (err) {
			return null
		}
		return (payload as any).sub ?? null
	}

	private static async getTokenPayload(token: string, isAccessToken: boolean): Promise<object> {	
		return new Promise((resolve, reject) => {
			if (process.env.JWT_ACCESS_SECRET == null || process.env.JWT_REFRESH_SECRET == null) {
				reject()
				return
			}
			const jwt_secret: string = isAccessToken == true ? process.env.JWT_ACCESS_SECRET : process.env.JWT_REFRESH_SECRET
			jwt.verify(
				token,
				jwt_secret,
				(err, payload) => {
					if (err) {
						return reject()
					}
					resolve(payload as object)
				})
		})
	}

	private static async generateToken(userId: string): Promise<Tokens> {
		return new Promise<Tokens>((resolve, reject) => {
			jwt.sign(
				{},
				process.env.JWT_ACCESS_SECRET as string,
				{
					subject: userId,
					expiresIn: "30m"
				},
				(error, t) => {
					if (error || !t) {
						reject()
						return
					}
					resolve(new Tokens(t, null))
				})
		})
	}

	private static async generateTokens(accountId: string): Promise<Tokens> {
		return new Promise<Tokens>((resolve, reject) => {
			jwt.sign(
				{},
				process.env.JWT_ACCESS_SECRET as string,
				{
					subject: accountId,
					expiresIn: "30m"
				},
				(error, token) => {
					if (error || !token) {
						reject()
						return
					}
					jwt.sign(
						{},
						process.env.JWT_REFRESH_SECRET as string,
						{
							subject: accountId,
							expiresIn: "30 days"
						},
						(error, refreshToken) => {
							if (error || !refreshToken) {
								reject()
								return
							}
							resolve(new Tokens(token, refreshToken))
						})
				})
		})
	}
}