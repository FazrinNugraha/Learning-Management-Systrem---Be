import mongoose, { mongo } from "mongoose";


const transactionModel = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    price: {
        type: Number,
        required: true
    },
    status : {
        type: String,
        enum: ['pending', 'succses','failed'],
        default: 'pending'
    }
},{
    timestamps: true
})

export default mongoose.model('transaction', transactionModel)