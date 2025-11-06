import express from "express";
import cors from "cors";
import db from "./models/index.js";
import Travels from "./routes/travelPackage.routes.js";


const app = express()
require('dotenv').config()

const corsOptions = {
    origin: "http://localhost:3000"
}



app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get('/', (req, res) => res.send('Bem vindo as Vendas de viagens!'))
app.post

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

const port = process.env.PORT || 3000