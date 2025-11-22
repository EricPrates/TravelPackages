
import dotenv from"dotenv";                     
import jwt from"jsonwebtoken" ;
import db from"../../models/index.js" ;
import bcrypt from"bcrypt" ;

dotenv.config();
const JWT_PRIVATE_KEY= process.env.JWT_PRIVATE_KEY; 
const GOOGLE_ID= process.env.GOOGLE_ID;
const GOOGLE_SECRET= process.env.GOOGLE_SECRET;

export const googleSignIn = async (req, res) => {
    try{
    const { token, user, email, name, picture } = req.body;
    const tokenResponse = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
    const tokenData = await tokenResponse.json();

    if(tokenData.error){
        return res.status(401).json({
            success: false,
            error:"Token inválido"
        })
    }

    let userRecord = await db.Users.findOne({ where: { email: email } });

    if(!userRecord){
        userRecord = await db.Users.create({
            name: name,
            email: email,
            googleId: user.id,
            role: 'customer',
        })
          const token = jwt.sign(
            { 
                email: userRecord.email,
                name: userRecord.name,
                id: userRecord.id, 
                role: userRecord.role 
            }, 
            JWT_PRIVATE_KEY, 
            { 
                expiresIn: '8h',
                algorithm: 'HS256'
            }, 
        );
        return res.status(201).json({
            success: true,
            data: {
                user: {
                    id: userRecord.id,
                    email: userRecord.email,
                    role: userRecord.role,
                    name: userRecord.name
                },
                token: token,
                token_type: "Bearer",
            }
        });
    }
    }catch(error){
        console.error('Erro no Google Sign-In:', error);
        return res.status(500).json({
            success: false,
            message: "Erro ao autenticar usuário com Google."
        });
    }
}
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
 
        
        if (!email || !password) {
            return res.status(400).send({ 
                message: "Email e senha são obrigatórios." 
            });
        }
        
        const findUser = await db.Users.findOne({ where: { email: email } });
    
        
        if (!findUser) {
            return res.status(401).send({ message: "Usuário ou senha inválidos." });
        }

        const isPasswordValid = await bcrypt.compare(password, findUser.password);
      
        if (!isPasswordValid) {
            return res.status(401).send({ message: "Usuário ou senha inválidos." });
        }
        
      
        if (!JWT_PRIVATE_KEY) {
                   return res.status(500).send({ message: "Erro de configuração do servidor" });
        }
        
     
        
         const token = jwt.sign(
            { 
                email: findUser.email,
                id: findUser.id, 
                role: findUser.role 
            }, 
            JWT_PRIVATE_KEY, 
            { 
                expiresIn: '8h',
                algorithm: 'HS256'
            }, 
        );

    
        return res.status(200).json({
            success: true,
            data: {
                user: {
                    id: findUser.id,
                    email: findUser.email,
                    role: findUser.role,
                    name: findUser.name
                },
                token: token,
                token_type: "Bearer",
            }
        });
                        
    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ 
            success: false,
            message: "Erro ao autenticar usuário." 
        });
    }
};




export const tokenValidated = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ 
            success: false,
            message: "Token de acesso requerido no formato Bearer." 
        });
    }
    
    const token = authHeader.split(" ")[1];
    
    try {
       
        const decoded = jwt.verify(token, JWT_PRIVATE_KEY, { algorithms: ['HS256'] });
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Erro na validação do token:', error);
        return res.status(401).json({ 
            success: false,
            message: "Token de acesso inválido ou expirado." 
        });
    }
}



export const requireAgent = (req, res, next) => {
    if(!req.user){
        return res.status(401).send({ message: "Token de acesso requerido." });
    }
    if (req.user.role !== 'agent') {
        return res.status(403).send({ message: "Acesso negado. Permissão de agente requerida." });
    }
    next();
}