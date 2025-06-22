const {Router} =require("express")
const route=Router()
const {bank,transaction}=require("../db/schema");
const { userexist } = require("../middleware/usermiddleware");
const  mongoose  = require("mongoose");

route.get("/balance",userexist,async(req,res)=>{
   try{
     const userbalance=await bank.findOne({userid:req.userid})
    res.json({
        balance:userbalance.balance
    })
   }catch(e){
    res.status(411).json({
        message:"can not get balance"
    })
   }
})

// route.post("/transfer",userexist,async(req,res)=>{
//   try{
// const session=await mongoose.startSession();
//   session.startTransaction()
//   const {amount,to}=req.body;
//   const useraccount=await bank.findOne({userid:req.userid}).session(session)
//   if(!useraccount||useraccount.balance<amount){
//     await session.abortTransaction();
//     res.status(411).json({
//         message:"insufficent balance"
//     })
//     return
//   }
//   const touser= await bank.findOne({userid:to}).session(session)
//   if(!touser){
//    await session.abortTransaction();
//     res.status(411).json({
//         message:"invalid uuser"
//     })
//     return
//   }
//   await bank.updateOne({userid:req.userid},{"$inc":{balance:-amount}}).session(session)
//   await bank.updateOne({userid:to},{"$inc":{balance:amount}}).session(session)
//   await session.commitTransaction();
//   res.status(200).json({
//       message:"Transfer successful"
//   })}catch(e){
//     res.json({
//       message:"error in transation"
//     })
//   }
  
// })


route.post("/transfer", userexist, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { amount, to, description } = req.body;

    const senderAccount = await bank.findOne({ userid: req.userid }).session(session);
    if (!senderAccount || senderAccount.balance < amount) {
      await session.abortTransaction();
      return res.status(411).json({ message: "Insufficient balance" });
    }

    const receiverAccount = await bank.findOne({ userid: to }).session(session);
    if (!receiverAccount) {
      await session.abortTransaction();
      return res.status(411).json({ message: "Invalid receiver" });
    }

    await bank.updateOne({ userid: req.userid }, { $inc: { balance: -amount } }).session(session);
    await bank.updateOne({ userid: to }, { $inc: { balance: amount } }).session(session);
  
    await transaction.create([{
      sender: req.userid,
      receiver: to,
      name: receiverAccount.name,  // Assuming name is a field in the bank schema
      amount,
      description: description || "Money Transfer",
      status: 'completed'
    }], { session });

    await session.commitTransaction();
    res.status(200).json({ message: "Transfer successful" });
  } catch (e) {
    await session.abortTransaction();
    res.status(500).json({ message: "Error in transaction" });
  } finally {
    session.endSession();
  }
});
route.post("/transfer/email", userexist, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { amount, toEmail, description } = req.body;

    const senderAccount = await bank.findOne({ userid: req.userid }).session(session);
    if (!senderAccount || senderAccount.balance < amount) {
      await session.abortTransaction();
      return res.status(411).json({ message: "Insufficient balance" });
    }

    const receiverAccount = await bank.findOne({ email: toEmail }).session(session);
    if (!receiverAccount) {
      await session.abortTransaction();
      return res.status(411).json({ message: "Receiver not found" });
    }

    await bank.updateOne({ userid: req.userid }, { $inc: { balance: -amount } }).session(session);
    await bank.updateOne({ email: toEmail }, { $inc: { balance: amount } }).session(session);
  
    await transaction.create([{
      sender: req.userid,
      receiver: receiverAccount.userid, // Ensure this field exists
      name: receiverAccount.name,
      amount,
      description: description || "Money Transfer",
      status: 'completed'
    }], { session });

    await session.commitTransaction();
    res.status(200).json({ message: "Transfer successful" });
  } catch (e) {
    await session.abortTransaction();
    res.status(500).json({ message: "Error in transaction" });
  } finally {
    session.endSession();
  }
});

route.get("/transactions", userexist, async (req, res) => {
  try {
    const txns = await transaction.find({
      $or: [
        { sender: req.userid },
        { receiver: req.userid }
      ]
    }).sort({ timestamp: -1 });

    res.json({ transactions: {
      txns: txns.map(txn => ({
        id: txn._id,
        sender: txn.sender,
        receiver: txn.receiver,
        name: txn.name,
        amount: txn.amount,
        timestamp: txn.timestamp,
        status: txn.status,
        description: txn.description
      }))
    } });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});


module.exports=route;