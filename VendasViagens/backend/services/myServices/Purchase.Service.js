import { Sequelize } from 'sequelize';
import db from '../../models/index.js';


const Op = db.Sequelize.Op;
const Users = db.Users;
const TravelPackage = db.TravelPackage;
const Purchase = db.Purchase;
const Wallet = db.Wallet;
const sequelize = db.sequelize;
export const findPurchasesByUser = async (req, res) => {
    const userId = req.params.userId;
    try {
        const purchases = await Purchase.findAll({
            where: { user_id: userId },
            include: [{
                model: TravelPackage, as: 'travelPackage',
                attributes: ['id', 'title', 'description', 'price', 'duration', 'destination', 'availableSlots', 'image'],
            }]
        });
        res.status(200).send(purchases);
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar compras do usuário.", error: error.message });
    }
}
export const createPurchaseWithCashOrMiles = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            user_id,
            travel_package_id,
            quantity,
            paymentChoice
        } = req.body;

        const [user, travelPackage, userWallet] = await Promise.all([
            Users.findByPk(user_id, { transaction }),
            TravelPackage.findByPk(travel_package_id, { transaction }),
            Wallet.findOne({ where: { userId: user_id }, transaction })
        ]);

        if (!user || !travelPackage || !userWallet) {
            await transaction.rollback();
            return res.status(404).send({ message: "Recurso não encontrado." });
        }

        const totalMoneyPrice = travelPackage.totalMoneyPrice * quantity;
        const totalMilesPrice = travelPackage.totalPriceMiles * quantity;

        let paidInMoney = 0;
        let paidInMiles = 0;

        if (paymentChoice === 'cash') {

            if (userWallet.balanceInCash < totalMoneyPrice) {
                await transaction.rollback();
                return res.status(400).send({ message: "Saldo em dinheiro insuficiente." });
            }
            paidInMoney = totalMoneyPrice;

        } else if (paymentChoice === 'miles') {

            if (userWallet.balanceInMiles < totalMilesPrice) {
                await transaction.rollback();
                return res.status(400).send({ message: "Saldo em milhas insuficiente." });
            }
            paidInMiles = totalMilesPrice;

        } else if (paymentChoice === 'mixed') {

            const { cashAmount, milesAmount } = req.body;

            if (cashAmount + milesAmount !== totalMoneyPrice) {
                await transaction.rollback();
                return res.status(400).send({ message: "Valor total do pagamento não corresponde ao preço." });
            }

            if (userWallet.balanceInCash < cashAmount) {
                await transaction.rollback();
                return res.status(400).send({ message: "Saldo em dinheiro insuficiente." });
            }

            if (userWallet.balanceInMiles < milesAmount) {
                await transaction.rollback();
                return res.status(400).send({ message: "Saldo em milhas insuficiente." });
            }

            paidInMoney = cashAmount;
            paidInMiles = milesAmount;
        }


        const newPurchase = await Purchase.create({
            userId: user_id,
            travelPackageId: travel_package_id,
            quantity,
            status: 'CONFIRMED',
            totalMoneyPrice,
            totalMilesPrice,
            paidInMoney,
            paidInMiles
        }, { transaction });


        await userWallet.update({
            balanceInCash: userWallet.balanceInCash - paidInMoney,
            balanceInMiles: userWallet.balanceInMiles - paidInMiles
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            success: true,
            data: {
                purchase: newPurchase,
                payment_summary: {
                    total_package_value: { money: totalMoneyPrice, miles: totalMilesPrice },
                    actually_paid: { money: paidInMoney, miles: paidInMiles }
                }
            }
        });

    } catch (error) {
        await transaction.rollback();
        res.status(500).send({
            success: false,
            message: "Erro ao criar compra.",
            error: error.message
        });
    }
};

export const cancelPurchase = async (req, res) => {
    const purchaseId = req.params.purchaseId;
    const transaction = await sequelize.transaction();
    try {
        const purchase = await Purchase.findByPk(purchaseId, { transaction });
        if (!purchase) {
            await transaction.rollback();
            return res.status(404).send({ message: "Compra não encontrada." });
        }
        if (purchase.status === 'CANCELLED') {
            await transaction.rollback();
            return res.status(400).send({ message: "Compra já está cancelada." });
        }
        purchase.status = 'CANCELLED';
        await purchase.save({ transaction });
        const userWallet = await Wallet.findOne({ where: { userId: purchase.userId }, transaction });
        if (userWallet) {
            userWallet.balanceInCash += parseFloat(purchase.paidInMoney);
            userWallet.balanceInMiles += parseFloat(purchase.paidInMiles);
            await userWallet.save({ transaction });
        }
        const travelPackage = await TravelPackage.findByPk(purchase.travelPackageId, { transaction });
        if (travelPackage) {
            travelPackage.availableSlots += purchase.quantity;
            await travelPackage.save({ transaction });
        }
        await transaction.commit();
        res.status(200).send({ message: "Compra cancelada com sucesso." });
    } catch (error) {
        await transaction.rollback();
        res.status(500).send({
            success: false,
            message: "Erro ao cancelar compra.",
            error: error.message
        });
    }
};