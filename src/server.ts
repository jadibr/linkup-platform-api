import mongoose from 'mongoose'

import { DbSeeder } from './db-seeder'
import { App } from "./app"
import { Logger } from './logger'

abstract class Server {
	private static port: number = 6014

	public static async run(): Promise<void> {
		Logger.initializeLogger()

		try {
			await Server.dbConnect()
		} catch (err) {
			Logger.logger.error(`Could not connect to: ${process.env.MONGO_URL}`, err)
			process.exit(1)
		}

		// try {
		// 	await DbSeeder.seedDatabase()
		// } catch (err) {
		// 	Logger.logger.error("Failed to seed the database", err)
		// }

		await Server.startApplication()
	}

	private static async dbConnect(): Promise<mongoose.Mongoose> {
		const runningInDevelopment = process.env.NODE_ENV?.toLowerCase() == 'development'
		const connectionScheme = runningInDevelopment ? 'mongodb' : 'mongodb+srv'

		return await mongoose.connect(

			// `${connectionScheme}://linkup-api:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URL}/linkup`,
			`mongodb://linkup-api:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URL}/linkup`,
			{
				connectTimeoutMS: 5000,
				// authSource: runningInDevelopment ? undefined : 'admin',
				// replicaSet: runningInDevelopment ? undefined : process.env.MONGO_REPL_SET,
				// tls: runningInDevelopment ? false : true
			})
	}

	private static async startApplication(): Promise<void> {
		App.createApp()
			.listen(Server.port, () => Server.onServerListen())
	}

	private static onServerListen():void {
		Logger.logger.info(`Express server listening on port ${Server.port}`)
	}
}

(async () => {
	await Server.run()
})()