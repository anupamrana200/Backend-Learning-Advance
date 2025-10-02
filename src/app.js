import express from "express"
import cors from cors
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
  origin: process.origin.CORS_ORIGIN,
  credentials: true
}))

app.use(express.json({limit: "16kb"})) //for form data
app.use(express.urlencoded({extended: true, limit: "16kb"})) //for url data
app.use(express.static("public")) //create a public assets which is used to store public info. 

app.use(cookieParser())

//router import 
import userRouter from "./routes/user.routes.js"

//routes declaration
app.use("/api/v1/users", userRouter)



export { app }

