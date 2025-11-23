import db from "../../models/index.js";
import { 
    successResponse, 
    errorResponse, 
    notFoundResponse, 
    badRequestResponse 
} from '../../utils/responseHandler.js';

const Op = db.Sequelize.Op;
const Wallet = db.Wallet;
const Users = db.Users;
const TravelPackage = db.TravelPackage;
const Purchase = db.Purchase;

/**
 * Função auxiliar para calcular saldo do usuário
 * Soma todas as transações da carteira
 * @param {number} userId - ID do usuário
 * @param {object} transaction - Transação Sequelize (opcional)
 * @returns {object} { balanceInCash, balanceInMiles }
 */
export async function getUserBalance(userId, transaction = null) {
    const transactions = await Wallet.findAll({
        where: { userId },
        transaction
    });

    let balanceInCash = 0;
    let balanceInMiles = 0;

    transactions.forEach(t => {
        const amount = parseFloat(t.amount);
        if (t.coinType === 'CASH') {
            balanceInCash += (t.type === 'DEPOSIT' ? amount : -amount);
        } else if (t.coinType === 'MILES') {
            balanceInMiles += (t.type === 'DEPOSIT' ? amount : -amount);
        }
    });

    return { balanceInCash, balanceInMiles };
}
export const cashDeposit = async (req, res) => {
    try {
        const { userId, amount, description = 'Depósito em dinheiro' } = req.body;
        
        const user = await db.Users.findByPk(userId);
        if (!user) {
            return notFoundResponse(res, 'Usuário');
        }
        
        if (!amount || amount <= 0) {
            return badRequestResponse(res, 'O valor do depósito deve ser maior que zero.');
        }

        // Criar transação de depósito
        const deposit = await Wallet.create({
            userId,
            type: 'DEPOSIT',
            coinType: 'CASH',
            amount: parseFloat(amount),
            description,
            date: new Date()
        });

        // Obter novo saldo
        const balance = await getUserBalance(userId);

        return successResponse(res, 200, {
            transaction: deposit,
            newBalance: balance.balanceInCash
        }, 'Depósito em dinheiro realizado com sucesso.');
    } catch (error) {
        return errorResponse(res, 500, 'Erro ao realizar depósito em dinheiro.', error.message);
    }
}
export const milesDeposit = async (req, res) => {
    try {
        const { userId, amount, description = 'Depósito de milhas' } = req.body;
        
        const user = await db.Users.findByPk(userId);
        if (!user) {
            return notFoundResponse(res, 'Usuário');
        }
        
        if (!amount || amount <= 0) {
            return badRequestResponse(res, 'O valor do depósito deve ser maior que zero.');
        }

        // Criar transação de depósito
        const deposit = await Wallet.create({
            userId,
            type: 'DEPOSIT',
            coinType: 'MILES',
            amount: parseFloat(amount),
            description,
            date: new Date()
        });

        // Obter novo saldo
        const balance = await getUserBalance(userId);

        return successResponse(res, 200, {
            transaction: deposit,
            newBalance: balance.balanceInMiles
        }, 'Depósito em milhas realizado com sucesso.');
    } catch (error) {
        return errorResponse(res, 500, 'Erro ao realizar depósito em milhas.', error.message);
    }
}
export const getBalance = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const user = await db.Users.findByPk(userId);
        if (!user) {
            return notFoundResponse(res, 'Usuário');
        }
        
        // Calcular saldo real baseado nas transações
        const balance = await getUserBalance(userId);
        
        return successResponse(res, 200, {
            userId: parseInt(userId),
            balanceInCash: balance.balanceInCash,
            balanceInMiles: balance.balanceInMiles
        });
    } catch (error) {
        return errorResponse(res, 500, 'Erro ao obter saldo.', error.message);
    }
}

export const getWalletStatement = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await Users.findByPk(userId);
        if (!user) {
            return notFoundResponse(res, 'Usuário');
        }

        // Buscar todas as transações da carteira
        const walletTransactions = await Wallet.findAll({
            where: { userId },
            order: [['date', 'DESC']]
        });

        // Calcular saldo atual
        const balance = await getUserBalance(userId);

        const statement = walletTransactions.map(transaction => ({
            id: transaction.id,
            date: transaction.date,
            type: transaction.type,
            coinType: transaction.coinType,
            amount: parseFloat(transaction.amount),
            description: transaction.description,
            // Mostrar como positivo (DEPOSIT) ou negativo (PURCHASE/WITHDRAWAL)
            displayAmount: transaction.type === 'DEPOSIT' 
                ? parseFloat(transaction.amount) 
                : -parseFloat(transaction.amount)
        }));

        return successResponse(res, 200, {
            userId: parseInt(userId),
            currentBalance: balance,
            transactions: statement,
            summary: {
                totalTransactions: statement.length,
                balanceInCash: balance.balanceInCash,
                balanceInMiles: balance.balanceInMiles
            }
        });
    } catch (error) {
        return errorResponse(res, 500, 'Erro ao obter extrato da carteira.', error.message);
    }
}