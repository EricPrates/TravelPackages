import db from "../../models/index.js";

const Op = db.Sequelize.Op;
const Wallet = db.Wallet;
const Users = db.Users;
const TravelPackage = db.TravelPackage;
const Purchase = db.Purchase;
export const cashDeposit = async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const user = await db.Users.findByPk(userId, {
            include: [{
                model: db.Wallet,
                as: 'wallet'
            }]
        });
        if (!user) {
            return res.status(404).send({ message: "Usuário não encontrado." });
        }
        if (amount <= 0) {
            return res.status(400).send({ message: "O valor do depósito deve ser maior que zero." });
        }

        res.status(200).send({ message: "Depósito em dinheiro realizado com sucesso." });
        await user.wallet.update({
            balanceInCash: parseFloat(user.wallet.balanceInCash) + parseFloat(amount)
        });
    } catch (error) {
        res.status(500).send({ message: "Erro ao realizar depósito em dinheiro.", error: error.message });
    }
}
export const milesDeposit = async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const user = await db.Users.findByPk(userId, {
            include: [{
                model: db.Wallet,
                as: 'wallet'
            }]
        });
        if (!user) {
            return res.status(404).send({ message: "Usuário não encontrado." });
        }
        if (amount <= 0) {
            return res.status(400).send({ message: "O valor do depósito deve ser maior que zero." });
        }
        await user.wallet.update({
            balanceInMiles: parseFloat(user.wallet.balanceInMiles) + parseFloat(amount)
        });
        res.status(200).json({ message: "Depósito em milhas realizado com sucesso." });
    } catch (error) {
        res.status(500).json({ message: "Erro ao realizar depósito em milhas.", error: error.message });
    }
}
export const getBalance = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await db.Users.findByPk(userId);
        if (!user) {
            return res.status(404).send({ message: "Usuário não encontrado." });
        }
        res.status(200).send({ balanceInCash: user.balanceInCash, balanceInMiles: user.balanceInMiles });
    } catch (error) {
        res.status(500).send({ message: "Erro ao obter saldo.", error: error.message });
    }
}

export const getWalletStatement = async (req, res) => {
    try {
        const { userId } = req.params;
        const wallet = await Wallet.findOne({
            where: { userId: userId },
            include: [{
                model: Users,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }]
        });
        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: "Carteira não encontrada para o usuário."
            });
        }
        const purchaseHistory = await Purchase.findAll({
            where: { userId: userId },
            include: [{
                model: TravelPackage,
                as: 'travelPackage',
                attributes: ['title', 'destination']
            }],
            attributes: ['id',
                'purchaseDate',
                'totalMoneyPrice',
                'totalMilesPrice',
                'paidInMoney',
                'paidInMiles',
                'status',
                'quantity'],
            order: [['purchaseDate', 'DESC']]
        });
        const statement = purchaseHistory.map(purchase => {
            const cashAmount = parseFloat(purchase.paidInMoney || purchase.totalMoneyPrice || 0);
            const milesAmount = parseFloat(purchase.paidInMiles || purchase.totalMilesPrice || 0);

            return {
                id: purchase.id,
                date: purchase.purchaseDate,
                cashAmount: -cashAmount,
                milesAmount: -milesAmount,
                description: purchase.travelPackage
                    ? `Compra: ${purchase.travelPackage.title} em ${purchase.travelPackage.destination}`
                    : 'Compra de pacote de viagem',
                status: purchase.status,
                details: {
                    quantity: purchase.quantity,
                    totalValue: purchase.totalMoneyPrice,
                    totalMiles: purchase.totalMilesPrice,
                    paidInCash: purchase.paidInMoney,
                    paidInMiles: purchase.paidInMiles
                }
            };
        });

        res.status(200).json({ success: true, data: statement });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erro ao obter extrato da carteira.",
            error: error.message
        });
    }
}