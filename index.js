const express=require("express")
const bodyparser=require("body-parser")
const app=express()
const cors=require("cors")
const mainroutes=require("./routes/index")
app.use(bodyparser.json())
app.use(cors())
app.use("/api/v1",mainroutes)

app.listen(3000,()=>{
    console.log("i am live")
})