const zod=require("zod")
const usertype=zod.object({
    username: zod.string().email(),
	firstname: zod.string(),
	lastname: zod.string(),
	password: zod.string().min(6)
})
const usersigin=zod.object({
	username:zod.string().email(),
	password:zod.string().min(6)
})
const updateuser=zod.object({
	firstname: zod.string(),
	lastname: zod.string(),
	password: zod.string().min(6)
})
module.exports={
    usertype,
	usersigin,
	updateuser,
}