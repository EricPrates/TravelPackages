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
export const createPurchase = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        

        const { user_id, travel_package_id, quantity } = req.body;
  
        const [user, travelPackage, userWallet ] = await Promise.all([
            Users.findByPk(user_id, { transaction }),
            TravelPackage.findByPk(travel_package_id, { transaction }),
            Wallet.findOne({ where: { userId: user_id }, transaction })
        ]);
        if (!user) {
            await transaction.rollback();
            return res.status(404).send({ message: "Usuário não encontrado." });
        }
        if (!travelPackage) {
            await transaction.rollback();
            return res.status(404).send({ message: "Pacote de viagem não encontrado." });
        }
        if (!userWallet) {
            await transaction.rollback();
            return res.status(404).send({ message: "Carteira do usuário não encontrada." });
        }
        const totalPrice = travelPackage.price * quantity;
    } catch (error) {
        res.status(500).send({ message: "Erro ao criar compra.", error: error.message });
    }
}