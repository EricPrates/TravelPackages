import express from "express";
import cors from "cors";
import db from "./models/index.js";
import Travels from "./routes/travelPackageRoutes.js";


const app = express()
require('dotenv').config()



app.use(cors())
app.use(express.json())


app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

const port = process.env.PORT || 3000