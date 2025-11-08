import db from "../models/index.js";
const Op = db.Sequelize.Op;

const Users = db.Users;
const TravelPackage = db.TravelPackage;


export const findAll = async (req, res) => {
    try{
             
        const data = await Users.findAll({
            include: [{
                model: TravelPackage, as: 'bookedPackages',
                attributes: ['id', 'title', 'description', 'duration', 'destination', 'availableSlots', 'image', ],
            }],
            attributes: ['id', 'name', 'email', 'role', 'cash', 'miles'],
        })
        res.send(data)
    }catch(error){
        res.status(500).send({
            message: error.message || "Erro ao buscar usuários"
        })
    }


};
export const findOneByName = async (req, res) => {
    
    try{
        const name = req.params.name;
        const condition = name ? {name: {[Op.iLike]: `%${name}%`}} : null;
        const data = await Users.findOne({
            where: condition,
            include: [{
                model: TravelPackage, as: 'bookedPackages',
                attributes: ['id', 'title', 'description', 'price', 'duration', 'destination', 'availableSlots', 'image', 'totalPrice'],
                through: { attributes: [] },
            }
            ]
        })
        if(data){
            res.status(200).send(data)
        }else{
            res.status(404).send({
                message: `Não foi possível encontrar o usuário com nome=${name}.`
            })
        }
    }catch(error){
        res.status(500).send({
            message: "Erro ao buscar usuário com nome=" + name
        })
    }
}

export const create = async (req, res) => {
    if(!req.body.name){
        res.status(400).send({
            message: "O campo 'name' é obrigatório."
        });
        return;
    }
    
    try {
        const user = await Users.create(req.body);
        res.status(201).send(user);
    } catch (error) {
        res.status(500).send({
            message: "Erro ao criar usuário."
        });
    }
};
export const update = async (req, res) => {
    const id = req.params.id;
    try{
        const [updated] = await Users.update (req.body, {
            where: {id: id}
        });
        if(updated > 0){
            const updatedUser = await Users.findByPk(id);
            res.status(200).send({
                message: "Usuário atualizado com sucesso.",
                data: updatedUser
            });
        }else{
            res.status(404).send({
                message: `Não foi possível encontrar o usuário com id=${id}.`
            });
        }
    }catch(error){
        res.status(500).send({
            message: "Erro ao atualizar usuário com id=" + id
        });
    }
};
export const remove = async (req, res) => {
    const id = req.params.id;

    try{
        const deleted = await Users.destroy({
            where: {id: id}
        });
        if(deleted > 0){
            res.status(200).send({
                message: "Usuário removido com sucesso."
            });
        }else{
            res.status(404).send({
                message: `Não foi possível encontrar o usuário com id=${id}.`
            });
        }
    }catch(error){
        res.status(500).send({
            message: "Erro ao remover usuário com id=" + id
        });
    }


};