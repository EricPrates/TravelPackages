import express from "express";
import cors from "cors";
import db from "./models/index.js";
import dotenv from "dotenv";
import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import travelPackageRouter from "./routes/travelPackage.routes.js";
import packageComponentsRouter from "./routes/packageComponents.routes.js";
import walletRouter from "./routes/wallet.routes.js";
import purchaseRouter from "./routes/purchase.routes.js";
dotenv.config();

const port = process.env.PORT || 4567;


const corsOptions = {
    origin: "http://localhost:4000"
}
const app = express()
app.use(cors(corsOptions))
app.use(express.json());
app.use(express.urlencoded({ extended: true }))




app.get('/', (req, res) => res.send('Bem vindo as Vendas de viagens!'))

  
authRouter(app);
userRouter(app);
walletRouter(app);
travelPackageRouter(app);
packageComponentsRouter(app);
purchaseRouter(app);

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
