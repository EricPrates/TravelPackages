
import dotenv from"dotenv";                     
import jwt from"jsonwebtoken" ;
import db from"../models/index.js" ;
import bcrypt from"bcrypt" ;

const JWT_PRIVATE_KEY= process.env.JWT_PRIVATE_KEY; 
dotenv.config();


export const login = async (req, res) => {
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
};



export const tokenValidated = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader && !authHeader.startsWith("Bearer ")) {
        return res.status(401).send({ message: "Token de acesso requerido Bearer." });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_PRIVATE_KEY,
             { algorithms: ['RS256'] });
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).send({ message: "Token de acesso inválido." });
    }
}



export const requireAgent = (req, res, next) => {
    if(!req.user){
        return res.status(401).send({ message: "Token de acesso requerido." });
    }
    if (req.user.role !== 'agent') {
        return res.status(403).send({ message: "Acesso negado. Permissão de administrador requerida." });
    }
    next();
}