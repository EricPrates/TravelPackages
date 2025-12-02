import db from "../../models/index.js";

const Op = db.Sequelize.Op;
const Wallet = db.Wallet;
const Users = db.Users;
const TravelPackage = db.TravelPackage;
const Purchase = db.Purchase;
const WalletTransaction = db.WalletTransaction;

export  async function  getWalletByUserId (req, res) {
    try {
        const userId = req.params.userId;
        const wallet = await Wallet.findOne({ where: { userId } });
        if (!wallet) {
            return res.status(404).json({ 
                success: false,
                message: 'Carteira não encontrada para o usuário especificado.'
            });
        }
        return res.status(200).json({
            success: true,
            data: wallet
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false,
            message: 'Erro ao obter carteira.',
            error: error.message
        });
    }
}
export async function getOrCreateWallet (userId) {
    let wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
        wallet = await Wallet.create({ userId, balanceCash: 0.00, balanceMiles: 0.00 });
    }
 
    return wallet;
}

export const addMilesPromo = async (req, res) => {
    const dbTransaction = await db.sequelize.transaction();
    
    try {
        const { amount, description } = req.body;
        const userId = req.user.id;
        
        if (!amount || amount <= 0) {
            await dbTransaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'O valor de milhas deve ser maior que zero.'
            });
        }
        
        const wallet = await getOrCreateWallet(userId);
        
     
        wallet.balanceMiles = parseFloat(wallet.balanceMiles) + parseFloat(amount);
        await wallet.save({ transaction: dbTransaction });
        
   
        const walletTransaction = await WalletTransaction.create({
            walletId: wallet.id,
            type: 'DEPOSIT',
            coinType: 'MILES',
            amount: parseFloat(amount),
            description: description || `Promoção de ${amount} milhas`,
            date: new Date()
        }, { transaction: dbTransaction });
        
        await dbTransaction.commit();
        
        return res.status(200).json({
            success: true,
            message: 'Milhas adicionadas com sucesso!',
            data: {
                transaction: walletTransaction,
                newBalance: parseFloat(wallet.balanceMiles)
            }
        });
        
    } catch (error) {
        await dbTransaction.rollback();
        console.error('Erro ao adicionar milhas promocionais:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao adicionar milhas promocionais.',
            error: error.message
        });
    }
};

export const cashDeposit = async (req, res) => {
    const dbTransaction = await db.sequelize.transaction()
    try {
        const { amount } = req.body;
        const userId = req.user.id;
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
        wallet.balanceCash = parseFloat(wallet.balanceCash) + parseFloat(amount);
        
        const milesEarned = Math.floor(parseFloat(amount) / 100);
        
        if (milesEarned > 0) {
            wallet.balanceMiles = parseFloat(wallet.balanceMiles) + milesEarned;
        }
        
        await wallet.save({ transaction: dbTransaction });

        const walletTransaction = await WalletTransaction.create({
            walletId: wallet.id,
            type: 'DEPOSIT',
            coinType: 'CASH',
            amount: parseFloat(amount),
            description: `Depósito em dinheiro de R$ ${amount}`,
            date: new Date()
        }, { transaction: dbTransaction });
        
        let milesTransaction = null;
        if (milesEarned > 0) {
            milesTransaction = await WalletTransaction.create({
                walletId: wallet.id,
                type: 'DEPOSIT',
                coinType: 'MILES',
                amount: milesEarned,
                description: `Bônus de ${milesEarned} milha(s) por depósito de R$ ${amount}`,
                date: new Date()
            }, { transaction: dbTransaction });
        }
        
        await dbTransaction.commit();
        return res.status(200).json({
            success: true,
            message: 'Depósito em dinheiro realizado com sucesso.',
            data: {
                transaction: walletTransaction,
                milesTransaction: milesTransaction,
                milesEarned: milesEarned,
                newBalanceCash: wallet.balanceCash,
                newBalanceMiles: wallet.balanceMiles
            }
        });
    } catch (error) {
        await dbTransaction.rollback();
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
                balanceCash: wallet.balanceCash,
                balanceMiles: wallet.balanceMiles,

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
    const userId = req.user.id;
    const user = await Users.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }

    const wallet = await getOrCreateWallet(userId);

    // Buscar todas as transações em ordem decrescente (mais recentes primeiro)
    const transactions = await WalletTransaction.findAll({
      where: { walletId: wallet.id },
      order: [['date', 'DESC']],  // Ordem decrescente
      include: [{
        model: Purchase,
        as: 'purchase',
        attributes: ['id', 'status', 'purchaseDate', 'paidInMiles', 'paidInMoney'],
        required: false
      }]
    });

    // Começar do saldo ATUAL e voltar no tempo
    let runningBalanceCash = parseFloat(wallet.balanceCash);
    let runningBalanceMiles = parseFloat(wallet.balanceMiles);

    const statement = transactions.map(t => {
      const amount = parseFloat(t.amount);
      const isDeposit = t.type === 'DEPOSIT';
      
      // Saldo DEPOIS da transação (saldo atual antes de reverter)
      const balanceAfterCash = runningBalanceCash;
      const balanceAfterMiles = runningBalanceMiles;

      // Reverter a operação para calcular saldo ANTES
      if (t.coinType === 'CASH') {
        runningBalanceCash -= isDeposit ? amount : -amount;
      } else if (t.coinType === 'MILES') {
        runningBalanceMiles -= isDeposit ? amount : -amount;
      }

      // Saldo ANTES da transação
      const balanceBeforeCash = runningBalanceCash;
      const balanceBeforeMiles = runningBalanceMiles;

      return {
        id: t.id,
        date: t.date,
        type: t.type,
        coinType: t.coinType,
        amount: amount,
        description: t.description,
        relatedPurchaseId: t.relatedPurchaseId,
        
       
        balanceBefore: {
          cash: balanceBeforeCash,
          miles: balanceBeforeMiles
        },
        balanceAfter: {
          cash: balanceAfterCash,
          miles: balanceAfterMiles
        },
        
        purchase: t.purchase ? {
          id: t.purchase.id,
          status: t.purchase.status,
          purchaseDate: t.purchase.purchaseDate,
          paidInMiles: parseFloat(t.purchase.paidInMiles || 0),
          paidInMoney: parseFloat(t.purchase.paidInMoney || 0)
        } : null,
        
        displayAmount: isDeposit ? amount : -amount
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        userId: parseInt(userId),
        walletId: wallet.id,
        currentBalance: {
          balanceCash: parseFloat(wallet.balanceCash),
          balanceMiles: parseFloat(wallet.balanceMiles)
        },
        transactions: statement,
        summary: {
          totalTransactions: statement.length,
          balanceCash: parseFloat(wallet.balanceCash),
          balanceMiles: parseFloat(wallet.balanceMiles)
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
        