import mongoose, { mongo } from "mongoose";

export default function connectDB() {
    const DATABASES_URL = process.env.DATABASES_URL ?? ""

    try {
        mongoose.connect(DATABASES_URL)
    } catch (error) {
        console.log(error);
        process.exit(1)

    }

    const dbConn = mongoose.connection

    dbConn.once('open', (_) => {
        console.log(`Databases Connected: ${DATABASES_URL}`)
    })

    dbConn.on(`'error`, (err) => {
        console.error(`Connection Error: ${err}`)
    })

}



