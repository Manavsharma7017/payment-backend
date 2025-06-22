const mongoose = require("mongoose");
require("dotenv").config(); 

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));



const userschema = new mongoose.Schema(
    {   username:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30

    },
        firstname:{
            type: String,
            required: true,
            trim: true,
            maxLength: 30
    
        },
        lastname:{ type: String,
            required: true,
            trim: true,
            maxLength: 30
    },
        password:{
            type: String,
            required: true,
            mimLength: 6
        },
    }
)

const user=mongoose.model("user",userschema)
const bankschema=new mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:user,
        required:true
    },
    name:{
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    balance:{
        type:Number,
        required:true
    }
})
const transactionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  name:{
    type: String,
    required: true,
    trim: true,
    maxLength: 50
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  description: {
    type: String,
    trim: true,
    maxLength: 100
  }
});
const transaction = mongoose.model("transaction", transactionSchema);

const bank=mongoose.model("bank",bankschema)
module.exports={
    user,
    bank,
    transaction
}