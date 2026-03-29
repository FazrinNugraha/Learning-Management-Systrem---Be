import express from 'express'
import { validateRequest } from '../middlewares/validateRequest.js'
import { signInSchema, signUpSchema } from '../utils/schema.js'
import { signInAction, signUpAction } from '../controllers/authController.js'
import { verifyToken } from '../middlewares/verifyToken.js'

const authRoutes = express.Router()

authRoutes.post('/sign-up', validateRequest(signUpSchema), signUpAction)
authRoutes.post('/sign-in', validateRequest(signInSchema), signInAction)

// Endpoint untuk validasi token — dipanggil oleh frontend saat load dashboard
authRoutes.get('/me', verifyToken, (req, res) => {
    return res.json({
        message: 'Token valid',
        data: req.user
    })
})

export default authRoutes