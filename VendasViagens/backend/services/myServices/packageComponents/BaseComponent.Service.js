import db from "../../../models/index.js";

const Op = db.Sequelize.Op;
const PackageComponents = db.PackageComponents;
const TravelPackage = db.TravelPackage;



export const findByType = async (req, res) => {
    const type = req.params.type;
    try {
        const data = await PackageComponents.findAll({
            where: {
                type: {
                    [Op.iLike]: `%${type}%`
                }
            }
        });
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send({
            message: "Erro ao buscar componente de pacote com tipo=" + type
        });
    }
};

export const findByPk = async (req, res) => {
    const id = req.params.id;
    try {
        const data = await PackageComponents.findByPk(id);
        if (data) {
            res.status(200).send(data);
        } else {
            res.status(404).send({
                message: `Não foi possível encontrar o componente de pacote com id=${id}.`
            });
        }
    } catch (error) {
        res.status(500).send({
            message: "Erro ao buscar componente de pacote com id=" + id
        });
    }
};
export const create = async (req, res) => {
    try {
    if (!req.body.type) {
        return res.status(400).send({
            message: "O tipo não pode estar vazio!"
        });
    }
        const data = await PackageComponents.create({
            name: req.body.name,
            description: req.body.description,
            type: req.body.type,
        });
        res.status(201).send(data);
    } catch (error) {
        res.status(500).send({
            message: error.message || "Erro ao criar componente de pacote"
        });
    }
   
};

export const update = async (req, res) => {
    const id = req.params.id;
    try{
        const existingComponent = await PackageComponents.findByPk(id);
        if (!existingComponent) {
            return res.status(404).send({
                message: `Componente de pacote com id=${id} não encontrado.`
            });
        }

        const [updated] = await PackageComponents.update(req.body, {
            where: { id: id }
        });

        const updatedComponent = await PackageComponents.findByPk(id);
        res.status(200).send(updatedComponent);
        
    } catch (error) {
        res.status(500).send({
            message: "Erro ao atualizar componente de pacote com id=" + id
        });
    }
};
export const remove = async (req, res) => {
    const id = req.params.id;
    try {
        const existingComponent = await PackageComponents.findByPk(id);
        if (!existingComponent) {
            return res.status(404).send({
                message: `Componente de pacote com id=${id} não encontrado.`
            });
        }

        const deleted = await PackageComponents.destroy({
            where: { id: id }
        });
        if (deleted == 1) {
            res.sendStatus(204);
        } else {
            res.status(404).send({
                message: `Não foi possível encontrar o componente de pacote com id=${id}.`
            });
        }
    } catch (error) {
        res.status(500).send({
            message: "Erro ao deletar componente de pacote com id=" + id
        });
    }
};

export const findAlWithPackages = async (req, res) => {
    try {
        const data = await PackageComponents.findAll({
            include: [
                {
                    model: TravelPackage, as: 'travelPackage',
                    attributes: ['id', 'title', 'destination', 'origin', 'departureDate', 'returnDate'],

                }
            ]
        });
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send({
            message: "Erro ao buscar componentes de pacotes com pacotes associados."
        });
    }
};