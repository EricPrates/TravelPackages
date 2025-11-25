import db from "../../models/index.js";

const Op = db.Sequelize.Op;
const Wallet = db.Wallet;
const Users = db.Users;
const TravelPackage = db.TravelPackage;
const Purchase = db.Purchase;

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

       
        const deposit = await Wallet.create({
            userId,
            type: 'DEPOSIT',
            coinType: 'CASH',
            amount: parseFloat(amount),
            description,
            date: new Date()
        });

      
        const balance =  getUserBalance(userId);

        return res.status(200).json({
            success: true,
            message: 'Depósito em dinheiro realizado com sucesso.',
            data: {
                transaction: deposit,
                newBalance: balance.balanceInCash
            }
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: 'Erro ao realizar depósito em dinheiro.', 
            error: error.message 
        });
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

        return res.status(200).json({
            success: true,
            message: 'Depósito em milhas realizado com sucesso.',
            data: {
                transaction: deposit,
                newBalance: balance.balanceInMiles
            }
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: 'Erro ao realizar depósito em milhas.', 
            error: error.message 
        });
    }
}
export const getBalance = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const user = await db.Users.findByPk(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuário não encontrado.' 
            });
        }
        
  
        const balance = await getUserBalance(userId);
        
        return res.status(200).json({
            success: true,
            data: {
                userId: parseInt(userId),
                balanceInCash: balance.balanceInCash,
                balanceInMiles: balance.balanceInMiles
            }
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: 'Erro ao obter saldo.', 
            error: error.message 
        });
    }
}

export const getWalletStatement = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await Users.findByPk(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuário não encontrado.' 
            });
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

        return res.status(200).json({
            success: true,
            data: {
                userId: parseInt(userId),
                currentBalance: balance,
                transactions: statement,
                summary: {
                    totalTransactions: statement.length,
                    balanceInCash: balance.balanceInCash,
                    balanceInMiles: balance.balanceInMiles
                }
            }
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: 'Erro ao obter extrato da carteira.', 
            error: error.message 
        });
    }
}