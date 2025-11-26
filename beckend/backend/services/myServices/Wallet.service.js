import db from "../../models/index.js";

const Op = db.Sequelize.Op;
const Wallet = db.Wallet;
const Users = db.Users;
const TravelPackage = db.TravelPackage;
const Purchase = db.Purchase;
const WalletTransaction = db.WalletTransaction;

export async function getOrCreateWallet (userId) {
    let wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
        wallet = await Wallet.create({ userId, balanceInCash: 0.00, balanceInMiles: 0.00 });
    }
 
    return wallet;
}
export const cashDeposit = async (req, res) => {
    const transaction = await db.sequelize.transaction()
    try {
        const { userId, amount, description = 'Depósito em dinheiro' } = req.body;
        
        const user = await db.Users.findByPk(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuário não encontrado.' 
            });
        }
        if(!amount || amount <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'O valor do depósito deve ser maior que zero.' 
            });
        }
        const wallet = await getOrCreateWallet(userId);
        wallet.balanceInCash = parseFloat(wallet.balanceInCash) + parseFloat(amount);
        await wallet.save({ transaction });

        const transaction = await WalletTransaction.create({
            walletId: wallet.id,
            type: 'DEPOSIT',
            coinType: 'CASH',
            amount: parseFloat(amount),
            description,
            date: new Date()
        }, { transaction });
        await transaction.commit();
        return res.status(200).json({
            success: true,
            message: 'Depósito em dinheiro realizado com sucesso.',
            data: {
                transaction,
                newBalance: wallet.balanceInCash
            }
        });
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ 
            success: false, 
            message: 'Erro ao realizar depósito em dinheiro.', 
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
        
  
        const wallet = await getOrCreateWallet(userId);
        return res.status(200).json({
            success: true,
            data: {
                userId: parseInt(userId),
                walletId: wallet.id,
                balanceInCash: wallet.balanceInCash,
                balanceInMiles: wallet.balanceInMiles,

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

        const wallet = await getOrCreateWallet(userId);
        
        // Buscar todas as transações
        const transactions = await WalletTransaction.findAll({
            where: { walletId: wallet.id },
            order: [['date', 'DESC']],
            include: [{
                model: Purchase,
                as: 'purchase',
                attributes: ['id', 'status', 'purchaseDate', 'paidInMiles', 'paidInMoney'],
                required: false
            }]
        });

        const statement = transactions.map(t => ({
            id: t.id,
            date: t.date,
            type: t.type,
            coinType: t.coinType,
            paidInMiles: t.purchase ? parseFloat(t.purchase.paidInMiles) : null,
            paidInMoney: t.purchase ? parseFloat(t.purchase.paidInMoney) : null,
            amount: parseFloat(t.amount),
            description: t.description,
            relatedPurchaseId: t.relatedPurchaseId,
              purchase: t.purchase ? {
                id: t.purchase.id,
                status: t.purchase.status,
                purchaseDate: t.purchase.purchaseDate,
                paidInMiles: parseFloat(t.purchase.paidInMiles || 0),  
                paidInMoney: parseFloat(t.purchase.paidInMoney || 0)
            } : null,
            displayAmount: t.type === 'DEPOSIT' 
                ? parseFloat(t.amount) 
                : -parseFloat(t.amount)
        }));

        return res.status(200).json({
            success: true,
            data: {
                userId: parseInt(userId),
                walletId: wallet.id,
                currentBalance: {
                    balanceInCash: parseFloat(wallet.balanceInCash),
                    balanceInMiles: parseFloat(wallet.balanceInMiles)
                },
                transactions: statement,
                summary: {
                    totalTransactions: statement.length,
                    balanceInCash: parseFloat(wallet.balanceInCash),
                    balanceInMiles: parseFloat(wallet.balanceInMiles)
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
};