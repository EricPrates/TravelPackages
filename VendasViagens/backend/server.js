import express from "express";
import cors from "cors";
import db from "./models/index.js";

import userRouter from "./routes/user.routes.js";
import dotenv from "dotenv";

dotenv.config();
const app = express()
const port = process.env.PORT || 4000;

const corsOptions = {
    origin: "http://localhost:4000"
}

app.listen(port, () => console.log(`App Rodando na porta ${port}!`))

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get('/', (req, res) => res.send('Bem vindo as Vendas de viagens!'))




userRouter(app);

(async () =>{
    try{
        await db.sequelize.sync({force: true});
        console.log("Banco de dados sincronizados");

        app.listen(port, () => {
           console.log(` Aplicação rodando na porta ${port}`);
        })
        
    } catch(error) {
        console.error(`Erro ao sincronizar dados: `, error)
    }
})()
