import db from '../../models/index.js';

const Purchase = db.Purchase;
const WalletTransaction = db.WalletTransaction;
const Wallet = db.Wallet;


export const getUserDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const { from, to } = req.query;
        
        // Ajustar datas para incluir o dia completo
        const endDate = to ? new Date(to) : new Date();
        endDate.setHours(23, 59, 59, 999); // Fim do dia
        
        const startDate = from ? new Date(from) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0); // Início do dia
        
  
        const wallet = await Wallet.findOne({ where: { userId } });
        
        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: 'Carteira não encontrada'
            });
        }
        
     
        const purchases = await Purchase.findAll({
            where: {
                userId,
                purchaseDate: {
                    [db.Sequelize.Op.between]: [startDate, endDate]
                }
            },
            order: [['purchaseDate', 'DESC']]
        });

        // Calcular totais usando paidInMoney e paidInMiles
        const totalSpentMoney = purchases.reduce((sum, p) => sum + parseFloat(p.paidInMoney || 0), 0);
        const totalSpentMiles = purchases.reduce((sum, p) => sum + parseFloat(p.paidInMiles || 0), 0);
        
       
        const milesEarned = await WalletTransaction.sum('amount', {
            where: {
                walletId: wallet.id,
                type: 'DEPOSIT',
                coinType: 'MILES',
                date: {
                    [db.Sequelize.Op.between]: [startDate, endDate]
                }
            }
        }) || 0;
        
   
        const purchasesByStatus = {
            pending: purchases.filter(p => p.status === 'PENDING').length,
            confirmed: purchases.filter(p => p.status === 'CONFIRMED').length,
            cancelled: purchases.filter(p => p.status === 'CANCELLED').length
        };
        
        return res.status(200).json({
            success: true,
            data: {
                period: {
                    from: startDate.toISOString().split('T')[0],
                    to: endDate.toISOString().split('T')[0]
                },
                currentBalance: {
                    cash: parseFloat(wallet.balanceCash),
                    miles: parseFloat(wallet.balanceMiles)
                },
                periodStats: {
                    totalSpentMoney: parseFloat(totalSpentMoney.toFixed(2)),
                    totalSpentMiles: parseInt(totalSpentMiles),
                    milesEarned: parseInt(milesEarned),
                    totalPurchases: purchases.length,
                    purchasesByStatus
                },
                recentPurchases: purchases.slice(0, 5).map(p => ({
                    id: p.id,
                    date: p.purchaseDate,
                    status: p.status,
                    paidInMoney: parseFloat(p.paidInMoney || 0),
                    paidInMiles: parseInt(p.paidInMiles || 0)
                }))
            }
        });
        
    } catch (error) {
        console.error('Erro ao buscar dashboard:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar dashboard',
            error: error.message
        });
    }
};
