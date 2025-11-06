import db from "../models/index.js";
const Op = db.Sequelize.Op;
const Users = db.Users;
const TravelPackage = db.TravelPackage;
const PackageComponents = db.PackageComponents;

export default findAll = async (req, res) => {
    try{
        const {name, des} = req.query.nome
        const condition = nome? {nome:{[Op.like]: `%${name}`}}: null;

        const data = await TravelPackage.findAll({
            where: condition,
            include: [{
                model:PackageComponents,
                as: 'travelPackage',
                atributes: ['id', 'nome'],
                through: {atributes: []}
            }]
        })
    }catch(error){

    }


};