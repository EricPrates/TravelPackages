import db from '../../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

const Users = db.Users;
const TravelPackage = db.TravelPackage;
const Wallet = db.Wallet;
export const findOne = async (req, res) => {
    const id = req.params.id;
    try {
        const data = await Users.findByPk(id, {
            attributes: ['id', 'name', 'email', 'role'],
            include: [{
                model: Wallet,
                as: 'wallet',
                attributes: ['balanceCash', 'balanceMiles']
            }]
        });

        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado.'
            });
        }

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar usuário.',
            error: error.message
        });
    }
};
export const register = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { name, email, password, role = 'agent' } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email e password são obrigatórios.'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email inválido. Use um formato válido como: usuario@exemplo.com'
            });
        }

        const exists = await Users.findOne({ where: { email } });
        if (exists) {
            return res.status(409).json({
                success: false,
                message: 'Usuário já existe.'
            });
        }

        const hash = await bcrypt.hash(password, 10);
        const user = await Users.create({ name, email, password: hash, role }, {transaction});
        await Wallet.create({ userId: user.id, balanceCash: 0.00, balanceMiles: 0.00 }, {transaction});
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_PRIVATE_KEY,
            { expiresIn: '8h', algorithm: 'HS256' }
        );
        await transaction.commit();
        return res.status(201).json({
            success: true,
            message: 'Usuário registrado com sucesso.',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                token: token,
                token_type: "Bearer"
            }
        });
    } catch (err) {
        console.error('Erro no registro:', err);
        return res.status(500).json({
            success: false,
            message: 'Erro ao criar usuário.',
            error: err.message
        });
    }
};

export const findAll = async (req, res) => {
    try {
        const data = await Users.findAll({
            include: [{
                model: TravelPackage, as: 'userTravelPackages',
                attributes: ['id', 'title', 'description', 'destination', 'availableSlots', 'departureDate', 'returnDate'],
            },
            {
                model: Wallet, as: 'wallet',
                attributes: ['balanceCash', 'balanceMiles']
            }],
            attributes: ['id', 'name', 'email', 'role'],
        });

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar usuários.',
            error: error.message
        });
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
                model: TravelPackage, as: 'userTravelPackages',
                attributes: ['id', 'title', 'description', 'destination', 'availableSlots', 'totalMoneyPrice', 'totalMilesPrice'],
                through: { attributes: [] },
            },
            {
                model: Wallet, as: 'wallet',
                attributes: ['balanceCash', 'balanceMiles']
            }],
            attributes: ['id', 'name', 'email', 'role'],
        });

        if (data.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Usuário com nome "${nameClean}" não encontrado.`
            });
        }

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar usuário.',
            error: error.message
        });
    }
};

export const create = async (req, res) => {
    if (!req.body.name) {
        return res.status(400).json({
            success: false,
            message: 'O campo nome é obrigatório.'
        });
    }

    try {
        const user = await Users.create(req.body);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado.'
            });
        }

        await Wallet.create({ userId: user.id, balanceCash: 0.00, balanceMiles: 0.00 });
        return res.status(201).json({
            success: true,
            message: 'Usuário criado com sucesso.',
            data: user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro ao criar usuário.',
            error: error.message
        });
    }
};
export const update = async (req, res) => {
    const id = req.params.id;
    try {
        const [updated] = await Users.update(req.body, {
            where: { id: id }
        });

        if (updated === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado.'
            });
        }

        const updatedUser = await Users.findByPk(id);
        return res.status(200).json({
            success: true,
            message: 'Usuário atualizado com sucesso.',
            data: updatedUser
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro ao atualizar usuário.',
            error: error.message
        });
    }
};

export const remove = async (req, res) => {
    const id = req.params.id;

    try {
        const deleted = await Users.destroy({
            where: { id: id }
        });

        if (deleted === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Usuário removido com sucesso.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro ao remover usuário.',
            error: error.message
        });
    }
};