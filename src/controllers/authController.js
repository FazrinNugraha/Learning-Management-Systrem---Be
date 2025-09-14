import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'

export const signUpAction = async (req , res) => {
    try {
        const body = req.body // untuk menampung request yang berisi nama,email,password

        const hashPassword = bcrypt.hashSync(body.password , 12)

        const user = new userModel({
            name: body.name,
            email: body.email,
            photo: 'testing.png',
            password: hashPassword,
            role: 'manager'
        })

        // action payment gateway mid rans

        await user.save()

        return res.json({
            message: 'Sign Up Succes' ,
            data : {
                midtrans_payment_url : 'https://www.google.com'
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal Server error'
        })
        
    }
}