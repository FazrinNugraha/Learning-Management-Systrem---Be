import express from "express"
import { helloWorld , helloMoon } from "../controllers/globalContoller.js"
import { validateRequest } from "../middlewares/validateRequest.js"
import { exampleSchema } from "../utils/schema.js"

const globalRoutes = express.Router()

globalRoutes.get('/hello-world' , helloWorld)

globalRoutes.get('/hello-moon' , helloMoon)

globalRoutes.post('/test-validate', validateRequest(exampleSchema), async (req , res) => {
    return res.json({message: 'Succses'})
}) 


export default globalRoutes