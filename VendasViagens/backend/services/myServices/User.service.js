import db from '../../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { 
    successResponse, 
    errorResponse, 
    notFoundResponse, 
    badRequestResponse,
    conflictResponse,
    createdResponse 
} from '../../utils/responseHandler.js';

const Users = db.Users;
const TravelPackage = db.TravelPackage;

export const findOne = async (req, res) => {
    const id = req.params.id;
    try {
        const data = await Users.findByPk(id, {
            attributes: ['id', 'name', 'email', 'role'],
        });
        
        if (!data) {
            return notFoundResponse(res, 'Usuário');
        }
        
        return successResponse(res, 200, data);
    } catch (error) {
        return errorResponse(res, 500, 'Erro ao buscar usuário.', error.message);
    }
};
export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'agent' } = req.body;
    
    if (!email || !password) {
      return badRequestResponse(res, 'Email e password são obrigatórios.');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return badRequestResponse(res, 'Email inválido. Use um formato válido como: usuario@exemplo.com');
    }
    
    const exists = await Users.findOne({ where: { email } });
    if (exists) {
      return conflictResponse(res, 'Usuário já existe.');
    }
    
    const hash = await bcrypt.hash(password, 10);
    const user = await Users.create({ name, email, password: hash, role });
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      process.env.JWT_PRIVATE_KEY, 
      { expiresIn: '8h', algorithm: 'HS256' }
    );
    
    return createdResponse(res, {
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        role: user.role 
      }, 
      token: token,
      token_type: "Bearer"
    }, 'Usuário registrado com sucesso.');
  } catch (err) {
    console.error('Erro no registro:', err);
    return errorResponse(res, 500, 'Erro ao criar usuário.', err.message);
  }
};

export const findAll = async (req, res) => {
    try {
        const data = await Users.findAll({
            include: [{
                model: TravelPackage, as: 'bookedPackages',
                attributes: ['id', 'title', 'description', 'destination', 'availableSlots', 'departureDate', 'returnDate'],
            }],
            attributes: ['id', 'name', 'email', 'role'],
        });
        
        return successResponse(res, 200, data);
    } catch (error) {
        return errorResponse(res, 500, 'Erro ao buscar usuários.', error.message);
    }
};
export const findOneByName = async (req, res) => {
    try {
        const name = req.query.name;
        
        if (!name) {
            return badRequestResponse(res, 'O nome é obrigatório.');
        }
        
        const nameClean = name.trim();
        const data = await Users.findAll({
            where: {
                name: {
                    [Op.like]: `%${nameClean}%`
                }
            },
            include: [{
                model: TravelPackage, as: 'bookedPackages',
                attributes: ['id', 'title', 'description', 'destination', 'availableSlots', 'totalMoneyPrice', 'totalMilesPrice'],
                through: { attributes: [] },
            }]
        });
        
        if (data.length === 0) {
            return notFoundResponse(res, `Usuário com nome "${nameClean}"`);
        }
        
        return successResponse(res, 200, data);
    } catch (error) {
        return errorResponse(res, 500, 'Erro ao buscar usuário.', error.message);
    }
};

export const create = async (req, res) => {
    if (!req.body.name) {
        return badRequestResponse(res, 'O campo nome é obrigatório.');
    }
    
    try {
        const user = await Users.create(req.body);
        return createdResponse(res, user, 'Usuário criado com sucesso.');
    } catch (error) {
        return errorResponse(res, 500, 'Erro ao criar usuário.', error.message);
    }
};
export const update = async (req, res) => {
    const id = req.params.id;
    try {
        const [updated] = await Users.update(req.body, {
            where: { id: id }
        });
        
        if (updated === 0) {
            return notFoundResponse(res, 'Usuário');
        }
        
        const updatedUser = await Users.findByPk(id);
        return successResponse(res, 200, updatedUser, 'Usuário atualizado com sucesso.');
    } catch (error) {
        return errorResponse(res, 500, 'Erro ao atualizar usuário.', error.message);
    }
};

export const remove = async (req, res) => {
    const id = req.params.id;

    try {
        const deleted = await Users.destroy({
            where: { id: id }
        });
        
        if (deleted === 0) {
            return notFoundResponse(res, 'Usuário');
        }
        
        return successResponse(res, 200, null, 'Usuário removido com sucesso.');
    } catch (error) {
        return errorResponse(res, 500, 'Erro ao remover usuário.', error.message);
    }
};