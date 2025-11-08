import db from "../models/index.js";
const Op = db.Sequelize.Op;
const Users = db.Users;
const TravelPackage = db.TravelPackage;
const PackageComponents = db.PackageComponents;

export const findAll = async (req, res) => {
    try{
        const data = await TravelPackage.findAll({
            include: [
                {
                    model: PackageComponents, as: 'components',
                    attributes: ['id', 'name', 'description', 'price'],
                },
                {
                    model: Users, as: 'users',
                    attributes: ['id', 'name', 'email', 'role'],
                    through: { attributes: [] },
                },
            ],
            attributes: ['id', 'title', 'description', 'price', 'duration', 'destination', 'availableSlots', 'image'],
        })
       
        if(data){
            res.status(200).send(data)
            
        }else{
            res.status(404).send({
                message: `Não foi possível encontrar pacotes de viagem.`
            })
        }
    }catch(error){
        res.status(500).send({
            message: error.message || "Erro ao buscar pacotes de viagem"
        })
    }
};

export const findOne = async (req, res) => {
    try{
        const id = req.params.id;
        const data = await TravelPackage.findByPk(id, {
            include: [
                {
                    model: PackageComponents, as: 'components',
                    attributes: ['id', 'name', 'description', 'price'],
                },
                {
                    model: Users, as: 'users',
                    attributes: ['id', 'name', 'email', 'role'],
                    through: { attributes: [] },
                },
            ],
            attributes: ['id', 'title', 'description', 'price', 'duration', 'destination', 'availableSlots', 'image'],
        });

        if(data){
            res.status(200).send(data);
        }else{
            res.status(404).send({
                message: `Pacote de viagem não encontrado.`
            });
        }
    }catch(error){
        res.status(500).send({
            message: error.message || "Erro ao buscar pacote de viagem"
        });
    }
};
export const create = async (req, res) => {
    if(!req.body.title){
        res.status(400).send({
            message: "O título é obrigatório."
        });
        return;
    
    }
    try {
        const travelPackage = await TravelPackage.create({
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            duration: req.body.duration,
            destination: req.body.destination,
            availableSlots: req.body.availableSlots,
            image: req.body.image
        });
        const data = await TravelPackage.create(travelPackage);
        res.status(202).send(data);
    } catch (error) {
        res.status(500).send({
            message: error.message || "Erro ao criar pacote de viagem"
        });
    }
};
export const update = async (req, res) =>{
    const travelPackageId = req.params.id;
    if(!req.body.title){
        res.status(400).send({
            message: "Dados são obrigatórios para atualização."
        })
        return;
    }
    try{
        const [updated] = await TravelPackage.update(req.body,{
            where: {id: travelPackageId}
        });
        if(updated === 1){
            res.status(204);
        }else{
            res.status(404).send({
                message: "Pacote de viagem não encontrado."
            });
        }
    }catch(error){
        res.status(500).send({
            message: error.message || "Erro ao atualizar pacote de viagem"
        });
    }
};

export const remove = async(req, res) =>{
    try {
        const id = req.params.id;
        const deleted = await TravelPackage.destroy({
            where: { id: id }
        });

        if(deleted == 1){
            res.status(204);
        }else{
            res.status(404).send({
                message: `Não foi possível encontrar o pacote de viagem com id=${id}.`
            });
        }
    }catch(error){
        res.status(500).send({
            message: "Erro ao deletar o pacote de viagem com id=" + id
        })
    }
};