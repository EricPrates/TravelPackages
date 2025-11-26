import db from '../../models/index.js';
import { getUserBalance } from './Wallet.service.js';

const Users = db.Users;
const TravelPackage = db.TravelPackage;
const Purchase = db.Purchase;
const Wallet = db.Wallet;
const WalletTransaction = db.WalletTransaction;
const sequelize = db.sequelize;


const MILES_EARNED_RATE = 0.01; 


export const findPurchasesWithFilters = async (req, res) => {
    try {
        const { userId, status, destination, from, to, page = 1, limit = 10 } = req.query;

       
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'userId é obrigatório.' 
            });
        }

  
        const where = { userId };

        if (status) {
            where.status = status;
        }

        if (from && to) {
            where.purchaseDate = {
                [db.Sequelize.Op.between]: [new Date(from), new Date(to)]
            };
        }

    
        const include = [{
            model: TravelPackage,
            as: 'travelPackage',
            attributes: ['id', 'title', 'description', 'destination', 'origin', 'departureDate', 'returnDate'],
            ...(destination && {
                where: {
                    destination: {
                        [db.Sequelize.Op.like]: `%${destination}%`
                    }
                }
            })
        }];

     
        const offset = (parseInt(page) - 1) * parseInt(limit);

      
        const { count, rows: purchases } = await Purchase.findAndCountAll({
            where,
            include,
            attributes: [
                'id', 'purchaseDate', 'status', 'quantity',
                'totalMoneyPrice', 'totalMilesPrice', 'paidInMoney', 'paidInMiles'
            ],
            order: [['purchaseDate', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        return res.status(200).json({
            success: true,
            data: {
                filters: {
                    userId,
                    status: status || 'all',
                    destination: destination || 'all',
                    period: from && to ? { from, to } : 'all'
                },
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / parseInt(limit)),
                    totalItems: count,
                    itemsPerPage: parseInt(limit)
                },
                purchases
            }
        });
    } catch (error) {
        console.error('Erro ao buscar compras:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar compras.', 
            error: error.message 
        });
    }
};

// Buscar compra específica por ID
export const findPurchaseById = async (req, res) => {
    try {
        const { purchaseId } = req.params;

        const purchase = await Purchase.findByPk(purchaseId, {
            include: [{
                model: TravelPackage,
                as: 'travelPackage',
                attributes: ['id', 'title', 'description', 'destination', 'origin', 'departureDate', 'returnDate']
            }],
            attributes: [
                'id', 'purchaseDate', 'status', 'quantity',
                'totalMoneyPrice', 'totalMilesPrice', 'paidInMoney', 'paidInMiles'
            ]
        });

        if (!purchase) {
            return res.status(404).json({ 
                success: false, 
                message: 'Compra não encontrada.' 
            });
        }

        return res.status(200).json({ 
            success: true, 
            data: purchase 
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar compra.', 
            error: error.message 
        });
    }
};
export const createPurchaseWithCashOrMiles = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            userId,
            walletId,
            travelPackageId,
            quantity = 1,
            paymentChoice,
            cashAmount = 0,
            milesAmount = 0
        } = req.body;

        if (!userId || !travelPackageId || !paymentChoice) {
            await transaction.rollback();
            return res.status(400).send({
                success: false,
                message: "Campos obrigatórios: userId, travelPackageId, paymentChoice"
            });
        }


        const [user, travelPackage] = await Promise.all([
            Users.findByPk(userId, { transaction }),
            TravelPackage.findByPk(travelPackageId, { transaction })
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


        const userBalance = await getUserBalance(userId, transaction);

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
            userId: userId,
            travelPackageId: travelPackageId,
            quantity,
            status: 'CONFIRMED',
            totalMoneyPrice,
            totalMilesPrice,
            paidInMoney,
            paidInMiles,
            purchaseDate: new Date()
        }, { transaction });


        if (paidInMoney > 0) {
            await WalletTransaction.create({
                relatedPurchaseId: newPurchase.id,
                walletId: walletId, 
                type: 'PURCHASE',
                coinType: 'CASH',
                amount: paidInMoney,
                description: `Compra do pacote: ${travelPackage.title}`,
                date: new Date()
            }, { transaction });
        }


        if (paidInMiles > 0) {
            await WalletTransaction.create({
                relatedPurchaseId: newPurchase.id,
                walletId: walletId,
                type: 'PURCHASE',
                coinType: 'MILES',
                amount: paidInMiles,
                description: `Compra do pacote: ${travelPackage.title}`,
                date: new Date()
            }, { transaction });
        }

        if (milesEarned > 0) {
            await WalletTransaction.create({
                relatedPurchaseId: newPurchase.id,
                walletId: walletId,
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

  
        await purchase.update({ status: 'CANCELLED' }, { transaction });

        // Reembolsar dinheiro
        if (purchase.paidInMoney > 0) {
            await WalletTransaction.create({
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
            await WalletTransaction.create({
                userId: purchase.userId,
                type: 'DEPOSIT',
                coinType: 'MILES',
                amount: parseFloat(purchase.paidInMiles),
                description: `Reembolso da compra #${purchaseId}`,
                date: new Date()
            }, { transaction });
        }

    
        const travelPackage = await TravelPackage.findByPk(purchase.travelPackageId, { transaction });
        if (travelPackage) {
            await travelPackage.update({
                availableSlots: travelPackage.availableSlots + purchase.quantity
            }, { transaction });
        }
        const payBackWallet = await Wallet.findByPk(purchase.walletId, { transaction });
        payBackWallet.balanceInCash = parseFloat(payBackWallet.balanceInCash) + parseFloat(purchase.paidInMoney);
        payBackWallet.balanceInMiles = parseFloat(payBackWallet.balanceInMiles) + parseFloat(purchase.paidInMiles);
        await payBackWallet.save({ transaction });
        
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