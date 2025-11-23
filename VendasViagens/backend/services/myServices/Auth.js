
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import db from "../../models/index.js";
import bcrypt from "bcrypt";

dotenv.config();
const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;
const GOOGLE_ID = process.env.GOOGLE_ID;
const GOOGLE_SECRET = process.env.GOOGLE_SECRET;
const REDIRECT_URL = process.env.GOOGLE_REDIRECT_URI;
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

export const generateAccessToken = (user) => {
    return jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role
    }, JWT_PRIVATE_KEY, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        algorithm: 'HS256'
    })
}
export const generateRefreshToken = (user) => {
    return jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role
    }, process.env.JWT_REFRESH_KEY, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        algorithm: 'HS256'
    });
};


export const getGoogleUrl = async (req, res) => {
    const params = new URLSearchParams({
        client_id: GOOGLE_ID,
        redirect_uri: REDIRECT_URL,
        response_type: 'code',
        scope: 'profile email',
        access_type: 'offline',
        prompt: 'consent'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    res.json({ url: authUrl });
};

export const handleGoogleCallback = async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) {
            return res.status(400).json({ message: 'Código de autorização não fornecido.' });
        }

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: GOOGLE_ID,
                client_secret: GOOGLE_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URL,
            }),
        });
        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            return res.status(400).json({ message: 'Erro ao obter token do Google.' });
        }

        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });
        if (!userResponse.ok) {
            return res.status(400).json({ message: 'Erro ao obter informações do usuário do Google.' });
        }

        const userData = await userResponse.json();
        let user = await db.Users.findOne({ where: { email: userData.email } });

        if (!user) {
            user = await db.Users.create({
                name: userData.name,
                email: userData.email,
                googleId: userData.id,
                role: 'customer',

            });
        } else if (!user.googleId) {
            user.googleId = userData.id;
            await user.save();
        }
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        return res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    name: user.name
                },
                accessToken: accessToken,
                refreshToken: refreshToken,
                token_type: "Bearer",
                expiresIn: ACCESS_TOKEN_EXPIRES_IN
            }
        });
    } catch (error) {
        console.error('Erro na autenticação com Google:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao autenticar com Google.'
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



        const accessToken = generateAccessToken(findUser);
        const refreshToken = generateRefreshToken(findUser);


        return res.status(200).json({
            success: true,
            data: {
                user: {
                    id: findUser.id,
                    email: findUser.email,
                    role: findUser.role,
                    name: findUser.name
                },
                accessToken: accessToken,
                refreshToken: refreshToken,
                token_type: "Bearer",
                expiresIn: ACCESS_TOKEN_EXPIRES_IN
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

export async function refreshToken(req, res) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({
            success: false,
            message: "Token de atualização é obrigatório."
        });
    }
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, { algorithms: ['HS256'] });
        const user = await db.Users.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado."
            });
        }
        const newAccessToken = generateAccessToken(user);
        return res.status(200).json({
            success: true,
            data: {
                accessToken: newAccessToken,
                token_type: "Bearer",
                expiresIn: ACCESS_TOKEN_EXPIRES_IN
            }
        });
    }catch (error) {
       
        return res.status(401).json({
            success: false,
            message: "Token de atualização inválido ou expirado."
        });
    }
}


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
        if (!req.user) {
            return res.status(401).send({ message: "Token de acesso requerido." });
        }
        if (req.user.role !== 'agent') {
            return res.status(403).send({ message: "Acesso negado. Permissão de agente requerida." });
        }
        next();
    }