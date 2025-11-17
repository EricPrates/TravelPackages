import db from "../models/index.js";
const Op = db.Sequelize.Op;
import {AmadeusFlightService} from "amadeus" ;
const PackageComponents = db.PackageComponents;
const TravelPackage = db.TravelPackage;


export const findOneByName = async (req, res) => {
    const name = req.params.name;
    const condition = name ? {name: {[Op.like]: `%${name}%`}} : null;
    try{
        const data = await PackageComponents.findAll({
            where: condition
        });
        if(data){
            res.status(200).send(data);
        }else{
            res.status(404).send({
                message: `Não foi possível encontrar componentes de pacote com nome=${name}.`
            });
        }
    }catch(error){
        res.status(500).send({
            message: "Erro ao buscar componentes de pacote com nome=" + name
        });
    }
}
export const findAllWithPrices = async (req, res) =>{
        try{
            const data = await PackageComponents.findAll({
                include: [{
                    model: TravelPackage, as: 'travelPackage',
                    attributes: ['id', 'title', 'description', 'priceMiles', 'priceCash', 'duration', 'destination', 'availableSlots', 'image'],
                    through: { attributes: [] },
                }]
            });
            res.send(data);
        }catch(error){
            res.status(500).send({
                message: "Erro ao buscar componentes de pacote"
            });
        }
    };

export const findByPk = async (req, res) => {
    const id = req.params.id;
    try{
        const data = await PackageComponents.findByPk(id, {
            include: [{
                model: TravelPackage, as: 'travelPackage',
                attributes: ['id', 'title', 'description', 'priceMiles', 'priceCash', 'duration', 'destination', 'availableSlots', 'image'],
                through: { attributes: [] },
            }]
        });
        if(data){
            res.status(200).send(data);
        }else{
            res.status(404).send({
                message: `Não foi possível encontrar o componente de pacote com id=${id}.`
            });
        }
    }catch(error){
        res.status(500).send({
            message: "Erro ao buscar componente de pacote com id=" + id
        });
    }
};
export const create = async (req, res) => {
    if(!req.body.name){
        res.status(400).send({
            message: "O conteúdo não pode estar vazio!"
        });
        return;
    }
    try{
        const data = await PackageComponents.create(req.body);
        res.status(201).send(data);
    }catch(error){
        res.status(500).send({
            message: "Erro ao criar componente de pacote"
        });
    }
};

export const update = async (req, res) => {
    const id = req.params.id;
    try{
        const [updated] = await PackageComponents.update (req.body, {
            where: {id: id}
        });
        if(updated > 0){
            const updatedComponent = await PackageComponents.findByPk(id);
            res.status(200).send({
                message: "Componente de pacote atualizado com sucesso.",
                data: updatedComponent
            });
        }else{
            res.status(404).send({
                message: `Não foi possível encontrar o componente de pacote com id=${id}.`
            });
        }
    }catch(error){
        res.status(500).send({
            message: "Erro ao atualizar componente de pacote com id=" + id
        });
    }
};
export const remove = async (req, res) => {
    const id = req.params.id;
    try{
        const deleted = await PackageComponents.destroy({
            where: {id: id}
        });
        if(deleted == 1){
          res.sendStatus(204);
        }else{
            res.status(404).send({
                message: `Não foi possível encontrar o componente de pacote com id=${id}.`
            });
        }
    }catch(error){
        res.status(500).send({
            message: "Erro ao deletar componente de pacote com id=" + id
        });
    }
};