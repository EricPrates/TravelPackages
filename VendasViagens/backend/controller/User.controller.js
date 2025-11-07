import db from "../models/index.js";
const Op = db.Sequelize.Op;
const Users = db.Users;
const TravelPackage = db.TravelPackage;
const PackageComponents = db.PackageComponents;

export const findAll = async (req, res) => {
    try{
             
        const data = await Users.findAll({
            
            attributes: ['id', 'name', 'email', 'role', 'cash', 'miles'],
        })
        res.send(data)
    }catch(error){
        res.status(500).send({
            message: error.message || "Erro ao buscar usuários"
        })
    }


};