import { where } from 'sequelize';
import db from '../../models/index.js';
import { getUserBalance } from './Wallet.service.js';
import { 
    successResponse, 
    errorResponse, 
    notFoundResponse, 
    badRequestResponse 
} from '../../utils/responseHandler.js';

const Users = db.Users;
const TravelPackage = db.TravelPackage;
const Purchase = db.Purchase;
const Wallet = db.Wallet;
const sequelize = db.sequelize;

// Taxa de conversão: 1 real = 100 milhas
const MILES_PER_REAL = 100;
const MILES_EARNED_RATE = 0.01; // 1% de cashback em milhas
export const reportUserPurchaseDate = async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).send({ message: "Parâmetros startDate e endDate são obrigatórios." });
        }
        const purchases = await Purchase.findAll({
            where: {
                purchaseDate: {
                    [db.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
                },
                userId: userId
            },
            include: [{
                model: Users, as: 'user',
                attributes: ['id', 'name', 'email']
            },
            {
                model: TravelPackage, as: 'travelPackage',
                attributes: ['id', 'title', 'destination']
            }],
             attributes: [
                'id', 
                'purchaseDate', 
                'status', 
                'quantity',
                'totalMoneyPrice', 
                'totalMilesPrice',
                'paidInMoney',
                'paidInMiles'
            ],

            order: [['purchaseDate', 'DESC']]
        });
        const userData = purchases.length > 0 ? purchases[0].user : null;
        res.status(200).json({
            success: true,
            data: {
                user: userData ? {
                    name: userData ? userData.name : 'N/A',
                    email: userData ? userData.email : 'N/A'
                } : null,
                period: {
                    start: startDate,
                    end: endDate
                },
                totalResults: purchases.length,
                purchases: purchases
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erro ao buscar compras por data.",
            error: error.message
        });
    }
};
export const findPurchasesByStatus = async (req, res) => {
    try {
        const {userId, status} = req.params;
        const purchases = await Purchase.findAll({
               where: {
                userId: userId,
                status: status
            },
            include: [{
                model: db.TravelPackage, 
                as: 'travelPackage',
                attributes: ['id', 'title', 'destination', 'origin']
            }],
            attributes: [
                'id', 'purchaseDate', 'status', 'quantity',
                'totalMoneyPrice', 'totalMilesPrice', 'paidInMoney', 'paidInMiles'
            ],
            order: [['purchaseDate', 'DESC']]
        });
        const userName = purchases.length > 0 && purchases[0].user 
            ? purchases[0].user.name 
            : 'N/A';
         res.status(200).json({ 
            success: true,
            data: {
                userName : userName,
                status: status,
                totalResults: purchases.length,
                purchases: purchases
            }
        });
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar compras por status.", error: error.message });
    }
};
export const findPurchasesByDestiantion = async (req, res) => {
    
    try {
        const {userId, destination} = req.params;
        const purchases = await Purchase.findAll({
               where: {
                userId: userId
            },
            include: [{
                model: db.TravelPackage, 
                as: 'travelPackage',
                where: { 
                    destination: {
                        [db.Sequelize.Op.like]: `%${destination}%` 
                    }
                },
                attributes: ['id', 'title', 'destination', 'origin'] 
            }],
            attributes: [
                'id', 'purchaseDate', 'status', 'quantity',
                'totalMoneyPrice', 'totalMilesPrice', 'paidInMoney', 'paidInMiles'
            ],
            order: [['purchaseDate', 'DESC']]
        });
        const userName = purchases.length > 0 && purchases[0].user 
            ? purchases[0].user.name 
            : 'N/A';
         res.status(200).json({ 
            success: true, 
            data: {
                userName : userName,
                destination: destination,
                totalResults: purchases.length,
                purchases: purchases
            }
        });
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar compras por destino.", error: error.message });
    }
};

export const findPurchasesByUser = async (req, res) => {
    const userId = req.params.userId;
    try {
        const purchases = await Purchase.findAll({
            where: { userId: userId },
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
            quantity = 1,
            paymentChoice,
            cashAmount = 0,
            milesAmount = 0
        } = req.body;

        if (!user_id || !travel_package_id || !paymentChoice) {
            await transaction.rollback();
            return res.status(400).send({
                success: false,
                message: "Campos obrigatórios: user_id, travel_package_id, paymentChoice"
            });
        }


        const [user, travelPackage] = await Promise.all([
            Users.findByPk(user_id, { transaction }),
            TravelPackage.findByPk(travel_package_id, { transaction })
        ]);

        if (!user) {
            await transaction.rollback();
            return res.status(404).send({ success: false, message: "Usuário não encontrado." });
        }

        if (!travelPackage) {
            await transaction.rollback();
            return res.status(404).send({ success: false, message: "Pacote não encontrado." });
        }


        if (travelPackage.availableSlots < quantity) {
            await transaction.rollback();
            return res.status(400).send({
                success: false,
                message: `Apenas ${travelPackage.availableSlots} vagas disponíveis.`
            });
        }


        const totalMoneyPrice = parseFloat(travelPackage.totalMoneyPrice) * quantity;
        const totalMilesPrice = parseFloat(travelPackage.totalMilesPrice) * quantity;


        const userBalance = await getUserBalance(user_id, transaction);

        let paidInMoney = 0;
        let paidInMiles = 0;
        let milesEarned = 0;


        if (paymentChoice === 'cash') {

            if (userBalance.balanceInCash < totalMoneyPrice) {
                await transaction.rollback();
                return res.status(400).send({
                    success: false,
                    message: `Saldo insuficiente. Necessário: R$ ${totalMoneyPrice.toFixed(2)}, Disponível: R$ ${userBalance.balanceInCash.toFixed(2)}`
                });
            }
            paidInMoney = totalMoneyPrice;
            milesEarned = Math.round(paidInMoney * MILES_EARNED_RATE); // 1% de cashback

        } else if (paymentChoice === 'miles') {

            if (userBalance.balanceInMiles < totalMilesPrice) {
                await transaction.rollback();
                return res.status(400).send({
                    success: false,
                    message: `Milhas insuficientes. Necessário: ${totalMilesPrice} milhas, Disponível: ${userBalance.balanceInMiles} milhas`
                });
            }
            paidInMiles = totalMilesPrice;

        } else if (paymentChoice === 'mixed') {



            if (cashAmount < 0 || milesAmount < 0) {
                await transaction.rollback();
                return res.status(400).send({
                    success: false,
                    message: "Valores de cashAmount e milesAmount devem ser positivos."
                });
            }


            const remainingValue = totalMoneyPrice - cashAmount;
            const milesNeeded = Math.ceil(remainingValue * (totalMilesPrice / totalMoneyPrice));


            if (milesAmount < milesNeeded) {
                await transaction.rollback();
                return res.status(400).send({
                    success: false,
                    message: `Milhas insuficientes para cobrir o restante. Necessário: ${milesNeeded} milhas, Fornecido: ${milesAmount} milhas`
                });
            }


            if (userBalance.balanceInCash < cashAmount) {
                await transaction.rollback();
                return res.status(400).send({
                    success: false,
                    message: `Saldo em dinheiro insuficiente. Necessário: R$ ${cashAmount.toFixed(2)}, Disponível: R$ ${userBalance.balanceInCash.toFixed(2)}`
                });
            }

            if (userBalance.balanceInMiles < milesAmount) {
                await transaction.rollback();
                return res.status(400).send({
                    success: false,
                    message: `Saldo em milhas insuficiente. Necessário: ${milesAmount} milhas, Disponível: ${userBalance.balanceInMiles} milhas`
                });
            }

            paidInMoney = cashAmount;
            paidInMiles = milesAmount;
            milesEarned = Math.round(paidInMoney * MILES_EARNED_RATE);

        } else {
            await transaction.rollback();
            return res.status(400).send({
                success: false,
                message: "paymentChoice inválido. Use: 'cash', 'miles' ou 'mixed'"
            });
        }


        const newPurchase = await Purchase.create({
            userId: user_id,
            travelPackageId: travel_package_id,
            quantity,
            status: 'CONFIRMED',
            totalMoneyPrice,
            totalMilesPrice,
            paidInMoney,
            paidInMiles,
            purchaseDate: new Date()
        }, { transaction });


        if (paidInMoney > 0) {
            await Wallet.create({
                userId: user_id,
                type: 'PURCHASE',
                coinType: 'CASH',
                amount: paidInMoney,
                description: `Compra do pacote: ${travelPackage.title}`,
                date: new Date()
            }, { transaction });
        }


        if (paidInMiles > 0) {
            await Wallet.create({
                userId: user_id,
                type: 'PURCHASE',
                coinType: 'MILES',
                amount: paidInMiles,
                description: `Compra do pacote: ${travelPackage.title}`,
                date: new Date()
            }, { transaction });
        }

        if (milesEarned > 0) {
            await Wallet.create({
                userId: user_id,
                type: 'DEPOSIT',
                coinType: 'MILES',
                amount: milesEarned,
                description: `Cashback de ${MILES_EARNED_RATE * 100}% sobre compra`,
                date: new Date()
            }, { transaction });
        }

        await travelPackage.update({
            availableSlots: travelPackage.availableSlots - quantity
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: "Compra realizada com sucesso!",
            data: {
                purchase: {
                    id: newPurchase.id,
                    status: newPurchase.status,
                    quantity: newPurchase.quantity,
                    purchaseDate: newPurchase.purchaseDate
                },
                package: {
                    id: travelPackage.id,
                    title: travelPackage.title,
                    destination: travelPackage.destination
                },
                payment_summary: {
                    total_package_value: {
                        money: totalMoneyPrice,
                        miles: totalMilesPrice
                    },
                    actually_paid: {
                        money: paidInMoney,
                        miles: paidInMiles
                    },
                    miles_earned: milesEarned
                }
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Erro ao criar compra:', error);
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
            return res.status(404).send({
                success: false,
                message: "Compra não encontrada."
            });
        }

        if (purchase.status === 'CANCELLED') {
            await transaction.rollback();
            return res.status(400).send({
                success: false,
                message: "Compra já está cancelada."
            });
        }

        // Atualizar status da compra
        await purchase.update({ status: 'CANCELLED' }, { transaction });

        // Reembolsar dinheiro
        if (purchase.paidInMoney > 0) {
            await Wallet.create({
                userId: purchase.userId,
                type: 'DEPOSIT',
                coinType: 'CASH',
                amount: parseFloat(purchase.paidInMoney),
                description: `Reembolso da compra #${purchaseId}`,
                date: new Date()
            }, { transaction });
        }

        // Reembolsar milhas
        if (purchase.paidInMiles > 0) {
            await Wallet.create({
                userId: purchase.userId,
                type: 'DEPOSIT',
                coinType: 'MILES',
                amount: parseFloat(purchase.paidInMiles),
                description: `Reembolso da compra #${purchaseId}`,
                date: new Date()
            }, { transaction });
        }

        // Devolver vagas ao pacote
        const travelPackage = await TravelPackage.findByPk(purchase.travelPackageId, { transaction });
        if (travelPackage) {
            await travelPackage.update({
                availableSlots: travelPackage.availableSlots + purchase.quantity
            }, { transaction });
        }

        await transaction.commit();

        res.status(200).send({
            success: true,
            message: "Compra cancelada e valores reembolsados com sucesso.",
            data: {
                refunded: {
                    money: parseFloat(purchase.paidInMoney),
                    miles: parseFloat(purchase.paidInMiles)
                }
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Erro ao cancelar compra:', error);
        res.status(500).send({
            success: false,
            message: "Erro ao cancelar compra.",
            error: error.message
        });
    }
};