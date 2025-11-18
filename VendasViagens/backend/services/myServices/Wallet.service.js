import db from "../../models/index.js";
const Op = db.Sequelize.Op;


export const cashDeposit = async (req, res) => {
    try{
        const { userId, amount } = req.body;
        const user = await db.Users.findByPk(userId);
        if(!user){
            return  res.status(404).send({ message: "Usuário não encontrado." });
        }
        if(amount <= 0){
            return res.status(400).send({ message: "O valor do depósito deve ser maior que zero." });
        }
        user.balanceInCash += parseFloat(amount);
        await user.save();
        await db.Transactions.create({
            type:'DEPOSIT',
            amount: amount,
            userId: userId,
            description: 'Depósito em dinheiro',
            coinType: 'CASH'
        });
        res.status(200).send({ message: "Depósito em dinheiro realizado com sucesso." });
    } catch (error) {
        res.status(500).send({ message: "Erro ao realizar depósito em dinheiro.", error: error.message });
    }
}
export const milesDeposit = async (req, res) => {
    try{
        const { userId, amount } = req.body;
        const user = await db.Users.findByPk(userId);
        if(!user){
            return  res.status(404).send({ message: "Usuário não encontrado." });
        }
        if(amount <= 0){
            return res.status(400).send({ message: "O valor do depósito deve ser maior que zero." });
        }
        user.balanceInMiles += parseFloat(amount);
        await user.save();
        await db.Transactions.create({
            type:'DEPOSIT',
            amount: amount,
            userId: userId,
            description: 'Depósito em milhas',
            coinType: 'MILES'
        });
        res.status(200).send({ message: "Depósito em milhas realizado com sucesso." });
    } catch (error) {
        res.status(500).send({ message: "Erro ao realizar depósito em milhas.", error: error.message });
    }
}
export const getBalance = async (req, res) => {
    try{
        const userId = req.params.userId;
        const user = await db.Users.findByPk(userId);
        if(!user){
            return res.status(404).send({ message: "Usuário não encontrado." });
        }
        res.status(200).send({ balanceInCash: user.balanceInCash, balanceInMiles: user.balanceInMiles });
    } catch (error) {
        res.status(500).send({ message: "Erro ao obter saldo.", error: error.message });
    }
}
export const getStatements = async (req, res) => {
    try{
        const userId = req.params.userId;
        if(!userId){
            return res.status(400).send({ message: "ID do usuário é obrigatório." });
        }
        const user = await db.Users.findByPk(userId);
        if(!user){
            return res.status(404).send({ message: "Usuário não encontrado." });
        }
        const transactions = await db.Transactions.findAll({
            where: { userId: userId },
            order: [['date', 'DESC']]
        });

        res.status(200).send({saldoAtual:{
            balanceInCash: user.balanceInCash,
            balanceInMiles: user.balanceInMiles
        }, transactions: transactions 
         });

        }catch (error) {
        res.status(500).send({ message: "Erro ao obter extrato.", error: error.message });
    }
}