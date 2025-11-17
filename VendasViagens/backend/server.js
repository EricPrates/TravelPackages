import express from "express";
import cors from "cors";
import db from "./models/index.js";
import dotenv from "dotenv";
import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import travelPackageRouter from "./routes/travelPackage.routes.js";
import {getFlightData, getAccessToken} from "./services/Amadeus.service.js";
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

  
userRouter(app);
authRouter(app);
travelPackageRouter(app);
app.get('/teste-voos', async (req, res) => {
    try {
        console.log("🚀 Iniciando teste de voos...");
        
        // Teste apenas o token primeiro
        console.log("1. Testando token...");
        const token = await getAccessToken();
        console.log("✅ Token obtido:", token ? "SIM" : "NÃO");
        
        // Teste os voos
        console.log("2. Testando voos...");
        const voos = await getFlightData();
        console.log("✅ Voos obtidos!");
        
        res.json({
            success: true,
            message: "API Amadeus funcionando!",
            token: token ? "✅ Válido" : "❌ Inválido",
            voos: voos.data ? `✅ ${voos.data.length} voos encontrados` : "❌ Nenhum voo"
        });
        
    } catch (error) {
        console.log("❌ Erro no teste:", error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


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
