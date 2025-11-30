import db from '../../models/index.js';

const Users = db.Users;
const TravelPackage = db.TravelPackage;
const Purchase = db.Purchase;
const Wallet = db.Wallet;
const WalletTransaction = db.WalletTransaction;
const PackageComponents = db.PackageComponents;
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

        // Formatar purchases para garantir que os valores apareçam
        const formattedPurchases = purchases.map(p => {
            const formatted = {
                id: p.id,
                purchaseDate: p.purchaseDate,
                status: p.status,
                quantity: p.quantity,
                totalMoneyPrice: parseFloat(p.totalMoneyPrice || 0),
                totalMilesPrice: parseFloat(p.totalMilesPrice || 0),
                paidInMoney: parseFloat(p.paidInMoney || 0),
                paidInMiles: parseFloat(p.paidInMiles || 0),
                travelPackage: p.travelPackage
            };
            
            return formatted;
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
                purchases: formattedPurchases
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

        // Formatar valores para garantir que sejam números
        const formattedPurchase = {
            id: purchase.id,
            purchaseDate: purchase.purchaseDate,
            status: purchase.status,
            quantity: purchase.quantity,
            totalMoneyPrice: parseFloat(purchase.totalMoneyPrice || 0),
            totalMilesPrice: parseFloat(purchase.totalMilesPrice || 0),
            paidInMoney: parseFloat(purchase.paidInMoney || 0),
            paidInMiles: parseFloat(purchase.paidInMiles || 0),
            travelPackage: purchase.travelPackage
        };

        return res.status(200).json({ 
            success: true, 
            data: formattedPurchase 
        });
    } catch (error) {
        console.error('Erro ao buscar compra:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar compra.', 
            error: error.message 
        });
    }
};

// FUNÇÕES AUXILIARES

async function getWallet(userId, transaction = null) {

    let wallet = await Wallet.findOne({ 
        where: { userId },
        transaction 
    });
    
   
    return wallet;
}

async function validatePurchaseData(userId, packageId, paymentChoice, transaction) {
    const [user, travelPackage, wallet] = await Promise.all([
        Users.findByPk(userId, { transaction }),
        TravelPackage.findByPk(packageId, { 
            include: [{
                model: PackageComponents,
                as: 'components'
            }],
            transaction 
        }),
        getWallet(userId, transaction)
    ]);

    if (!user) throw new Error('Usuário não encontrado.');
    if (!travelPackage) throw new Error('Pacote não encontrado.');
    
    // Recalcular preços com base nos componentes
    if (travelPackage.components && travelPackage.components.length > 0) {
        travelPackage.totalMoneyPrice = travelPackage.components.reduce((sum, comp) => 
            sum + parseFloat(comp.moneyPrice || 0), 0
        );
        travelPackage.totalMilesPrice = travelPackage.components.reduce((sum, comp) => 
            sum + parseFloat(comp.milesPrice || 0), 0
        );
    }
    
    return { user, travelPackage, wallet };
}

function calculatePaymentAmounts(paymentChoice, totalMoneyPrice, totalMilesPrice, cashAmount, milesAmount) {
    let paidInMoney = 0;
    let paidInMiles = 0;
    let milesEarned = 0;

    if (paymentChoice === 'cash') {
        paidInMoney = totalMoneyPrice;
        milesEarned = Math.round(paidInMoney * MILES_EARNED_RATE);
    } else if (paymentChoice === 'miles') {
        paidInMiles = totalMilesPrice;
    } else if (paymentChoice === 'mixed') {
        paidInMoney = cashAmount;
        paidInMiles = milesAmount;
        milesEarned = Math.round(paidInMoney * MILES_EARNED_RATE);
    }

    return { paidInMoney, paidInMiles, milesEarned };
}

function validateBalance(paymentChoice, currentBalanceCash, currentBalanceMiles, totalMoneyPrice, totalMilesPrice, cashAmount, milesAmount) {
    if (paymentChoice === 'cash') {
        if (currentBalanceCash < totalMoneyPrice) {
            throw new Error(`Saldo insuficiente. Necessário: R$ ${totalMoneyPrice.toFixed(2)}, Disponível: R$ ${currentBalanceCash.toFixed(2)}`);
        }
    } else if (paymentChoice === 'miles') {
        if (currentBalanceMiles < totalMilesPrice) {
            throw new Error(`Milhas insuficientes. Necessário: ${totalMilesPrice} milhas, Disponível: ${currentBalanceMiles} milhas`);
        }
    } else if (paymentChoice === 'mixed') {
        if (cashAmount < 0 || milesAmount < 0) {
            throw new Error('Valores de cashAmount e milesAmount devem ser positivos.');
        }

        const remainingValue = totalMoneyPrice - cashAmount;
        const milesNeeded = Math.ceil(remainingValue * (totalMilesPrice / totalMoneyPrice));

        if (milesAmount < milesNeeded) {
            throw new Error(`Milhas insuficientes para cobrir o restante. Necessário: ${milesNeeded} milhas, Fornecido: ${milesAmount} milhas`);
        }

        if (currentBalanceCash < cashAmount) {
            throw new Error(`Saldo em dinheiro insuficiente. Necessário: R$ ${cashAmount.toFixed(2)}, Disponível: R$ ${currentBalanceCash.toFixed(2)}`);
        }

        if (currentBalanceMiles < milesAmount) {
            throw new Error(`Saldo em milhas insuficiente. Necessário: ${milesAmount} milhas, Disponível: ${currentBalanceMiles} milhas`);
        }
    }
}

async function processWalletTransactions(wallet, paidInMoney, paidInMiles, milesEarned, currentBalanceCash, currentBalanceMiles, travelPackage, purchaseId, transaction) {
    // Deduzir dinheiro
    if (paidInMoney > 0) {
        wallet.balanceCash = currentBalanceCash - paidInMoney;
        
        await WalletTransaction.create({
            walletId: wallet.id,
            type: 'PURCHASE',
            coinType: 'CASH',
            amount: paidInMoney,
            description: `Compra do pacote: ${travelPackage.title}`,
            relatedPurchaseId: purchaseId,
            date: new Date()
        }, { transaction });
    }

    // Deduzir milhas
    if (paidInMiles > 0) {
        wallet.balanceMiles = currentBalanceMiles - paidInMiles;
        
        await WalletTransaction.create({
            walletId: wallet.id,
            type: 'PURCHASE',
            coinType: 'MILES',
            amount: paidInMiles,
            description: `Compra do pacote: ${travelPackage.title}`,
            relatedPurchaseId: purchaseId,
            date: new Date()
        }, { transaction });
    }

    // Adicionar cashback
    if (milesEarned > 0) {
        wallet.balanceMiles = parseFloat(wallet.balanceMiles) + milesEarned;
        
        await WalletTransaction.create({
            walletId: wallet.id,
            type: 'DEPOSIT',
            coinType: 'MILES',
            amount: milesEarned,
            description: `Cashback de ${MILES_EARNED_RATE * 100}% sobre compra #${purchaseId}`,
            relatedPurchaseId: purchaseId,
            date: new Date()
        }, { transaction });
    }

    await wallet.save({ transaction });
}

//FUNÇÃO PRINCIPAL (REFATORADA)

export const createPurchaseWithCashOrMiles = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { packageId, quantity = 1, paymentChoice, cashAmount = 0, milesAmount = 0 } = req.body;
        const userId = req.user.id;

        // Validação de campos obrigatórios
        if (!userId || !packageId || !paymentChoice) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Campos obrigatórios: userId, packageId, paymentChoice"
            });
        }

        // Validar paymentChoice
        if (!['cash', 'miles', 'mixed'].includes(paymentChoice)) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "paymentChoice inválido. Use: 'cash', 'miles' ou 'mixed'"
            });
        }

        // Buscar e validar dados
        const { user, travelPackage, wallet } = await validatePurchaseData(userId, packageId, paymentChoice, transaction);

        // Verificar vagas disponíveis
        if (travelPackage.availableSlots < quantity) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: `Apenas ${travelPackage.availableSlots} vagas disponíveis.`
            });
        }

        // Calcular valores
        const totalMoneyPrice = parseFloat(travelPackage.totalMoneyPrice) * quantity;
        const totalMilesPrice = parseFloat(travelPackage.totalMilesPrice) * quantity;
        const currentBalanceCash = parseFloat(wallet.balanceCash);
        const currentBalanceMiles = parseFloat(wallet.balanceMiles);

        // Validar saldo
        validateBalance(paymentChoice, currentBalanceCash, currentBalanceMiles, totalMoneyPrice, totalMilesPrice, cashAmount, milesAmount);

        // Calcular valores de pagamento
        const { paidInMoney, paidInMiles, milesEarned } = calculatePaymentAmounts(
            paymentChoice, totalMoneyPrice, totalMilesPrice, cashAmount, milesAmount
        );

        // Criar a compra
        const newPurchase = await Purchase.create({
            userId,
            packageId,
            quantity,
            status: 'CONFIRMED',
            totalMoneyPrice,
            totalMilesPrice,
            paidInMoney,
            paidInMiles,
            purchaseDate: new Date()
        }, { transaction });

        // Processar transações da wallet
        await processWalletTransactions(
            wallet, paidInMoney, paidInMiles, milesEarned, 
            currentBalanceCash, currentBalanceMiles, 
            travelPackage, newPurchase.id, transaction
        );

        // Reduzir vagas disponíveis
        await travelPackage.update({
            availableSlots: travelPackage.availableSlots - quantity
        }, { transaction });

        await transaction.commit();

        return res.status(201).json({
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
                },
                new_balance: {
                    cash: parseFloat(wallet.balanceCash),
                    miles: parseFloat(wallet.balanceMiles)
                }
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Erro ao criar compra:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Erro ao criar compra.",
            error: error.message
        });
    }
};


export const cancelPurchase = async (req, res) => {
    const purchaseId = req.params.purchaseId;
    const dbTransaction = await sequelize.transaction();

    try {
        const purchase = await Purchase.findByPk(purchaseId, { transaction: dbTransaction });

        if (!purchase) {
            await dbTransaction.rollback();
            return res.status(404).json({
                success: false,
                message: "Compra não encontrada."
            });
        }

        if (purchase.status === 'CANCELLED') {
            await dbTransaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Compra já está cancelada."
            });
        }

        // Obter wallet do usuário
        const wallet = await getWallet(purchase.userId, dbTransaction);  

        
        await purchase.update({ status: 'CANCELLED' }, { transaction: dbTransaction });

      
        if (purchase.paidInMoney > 0) {
            wallet.balanceCash = parseFloat(wallet.balanceCash) + parseFloat(purchase.paidInMoney);
            
            await WalletTransaction.create({
                walletId: wallet.id, 
                type: 'DEPOSIT',
                coinType: 'CASH',
                amount: parseFloat(purchase.paidInMoney),
                description: `Reembolso da compra #${purchaseId}`,
                relatedPurchaseId: purchaseId,
                date: new Date()
            }, { transaction: dbTransaction });
        }

       
        if (purchase.paidInMiles > 0) {
            wallet.balanceMiles = parseFloat(wallet.balanceMiles) + parseFloat(purchase.paidInMiles);
            
            await WalletTransaction.create({
                walletId: wallet.id, 
                type: 'DEPOSIT',
                coinType: 'MILES',
                amount: parseFloat(purchase.paidInMiles),
                description: `Reembolso da compra #${purchaseId}`,
                relatedPurchaseId: purchaseId,
                date: new Date()
            }, { transaction: dbTransaction });
        }


        await wallet.save({ transaction: dbTransaction });

        // Devolver vagas ao pacote
        const travelPackage = await TravelPackage.findByPk(purchase.packageId, { transaction: dbTransaction });
        if (travelPackage) {
            await travelPackage.update({
                availableSlots: travelPackage.availableSlots + purchase.quantity
            }, { transaction: dbTransaction });
        }

        await dbTransaction.commit();

        return res.status(200).json({
            success: true,
            message: "Compra cancelada e valores reembolsados com sucesso.",
            data: {
                refunded: {
                    money: parseFloat(purchase.paidInMoney),
                    miles: parseFloat(purchase.paidInMiles)
                },
                new_balance: {
                    cash: parseFloat(wallet.balanceCash),
                    miles: parseFloat(wallet.balanceMiles)
                }
            }
        });

    } catch (error) {
        await dbTransaction.rollback();
        console.error('Erro ao cancelar compra:', error);
        return res.status(500).json({
            success: false,
            message: "Erro ao cancelar compra.",
            error: error.message
        });
    }
};
