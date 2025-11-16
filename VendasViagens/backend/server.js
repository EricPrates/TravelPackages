import express from "express";
import cors from "cors";
import db from "./models/index.js";
import userRouter from "./routes/user.routes.js";
import dotenv from "dotenv";

dotenv.config();
const app = express()
const port = process.env.PORT || 4000;
const jwt = require('jsonwebtoken');
const PRIVATE_KEY = process.env.JWT_SECRET; 

const corsOptions = {
    origin: "http://localhost:4000"
}

app.listen(port, () => console.log(`App Rodando na porta ${port}!`))

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get('/', (req, res) => res.send('Bem vindo as Vendas de viagens!'))
    

app.post('/auth/login', async (req, res) =>{
    const { email, password } = req.body;
    try{
        if (!email || !password) {
            return res.status(400).send({ 
                message: "Email e senha são obrigatórios." 
            });
        }
        
        const findUser = await db.Users.findOne({ where: { email: email} });
        if(!findUser){
            return res.status(401).send({ message: "Usuário ou senha inválidos." });
        }

        const isPasswordValid = await bcrypt.compare(password, findUser.password);
        if (!isPasswordValid) {
            return res.status(401).send({ message: "Usuário ou senha inválidos." });
        }
        
        const token = jwt.sign(
            { 
                email: findUser.email,
                id: findUser.id, 
                role: findUser.role 
            }, PRIVATE_KEY, 
            { 
                expiresIn: '15m',
                algorithm: 'RS256'
            }
        );

            return res.status(200).send(
                {
                    data: {
                        user:{
                            id: findUser.id,
                            email: findUser.email,
                            role: findUser.role,
                            name: findUser.name
                        },
                        token: token,
                        token_type: "Bearer",
                    }
                });
                        
            }catch(error){
                return res.status(500).send({ message: "Erro ao autenticar usuário." });
            }
});
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
