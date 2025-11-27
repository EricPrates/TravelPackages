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
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erro ao buscar componente de pacote com tipo=" + type
        });
    }
};

export const findByPk = async (req, res) => {
    const id = req.params.id;
    try {
        const data = await PackageComponents.findByPk(id);
        if (data) {
            res.status(200).json({ success: true, data });
        } else {
            res.status(404).json({
                success: false,
                message: `Não foi possível encontrar o componente de pacote com id=${id}.`
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erro ao buscar componente de pacote com id=" + id
        });
    }
};

export const create = async (req, res) => {
    try {
        if (!req.body.type) {
            return res.status(400).json({
                success: false,
                message: "O tipo não pode estar vazio!"
            });
        }
        const data = await PackageComponents.create({
            name: req.body.name,
            description: req.body.description,
            type: req.body.type,
        });
        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Erro ao criar componente de pacote"
        });
    }
};

export const updatePackageTotals = async (packageId, transaction = null) => {
    const components = await PackageComponents.findAll({
        where: { packageId },
        ...(transaction && { transaction })
    });
    
    const totalMoneyPrice = components.reduce((sum, comp) => sum + Number(comp.moneyPrice || 0), 0);
    const totalMilesPrice = components.reduce((sum, comp) => sum + Number(comp.milesPrice || 0), 0);
    
    await TravelPackage.update({
        totalMoneyPrice,
        totalMilesPrice
    }, {
        where: { id: packageId },
        ...(transaction && { transaction })
    });
    
    return { totalMoneyPrice, totalMilesPrice };
};

export const update = async (req, res) => {
    const id = req.params.id;
    try {
        const existingComponent = await PackageComponents.findByPk(id);
        if (!existingComponent) {
            return res.status(404).json({
                success: false,
                message: `Componente de pacote com id=${id} não encontrado.`
            });
        }

        const [updated] = await PackageComponents.update(req.body, {
            where: { id: id }
        });

        const updatedComponent = await PackageComponents.findByPk(id);
        res.status(200).json({ success: true, data: updatedComponent });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erro ao atualizar componente de pacote com id=" + id
        });
    }
};

export const remove = async (req, res) => {
    const id = req.params.id;
    try {
        const existingComponent = await PackageComponents.findByPk(id);
        if (!existingComponent) {
            return res.status(404).json({
                success: false,
                message: `Componente de pacote com id=${id} não encontrado.`
            });
        }

        const deleted = await PackageComponents.destroy({
            where: { id: id }
        });
        if (deleted == 1) {
            res.status(200).json({ success: true, message: "Componente deletado com sucesso" });
        } else {
            res.status(404).json({
                success: false,
                message: `Não foi possível encontrar o componente de pacote com id=${id}.`
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erro ao deletar componente de pacote com id=" + id
        });
    }
};

export const findAllWithPackages = async (req, res) => {
    try {
        const data = await PackageComponents.findAll({
            include: [
                {
                    model: TravelPackage, as: 'travelPackage',
                    attributes: ['id', 'title', 'destination', 'origin', 'departureDate', 'returnDate'],
                }
            ]
        });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erro ao buscar componentes de pacotes com pacotes associados."
        });
    }
};

export const createFlightComponent = async (componentData, transaction = null) => {
    const {description, amadeusId, moneyPrice, milesPrice, origin, destination, departureDate, returnDate} = componentData;
    return await PackageComponents.create({
        packageId: componentData.packageId,
        name: `${origin} to ${destination} flight`,
        type: 'FLIGHT',
        description,
        amadeusId,
        moneyPrice: Number(moneyPrice ?? 0),
        milesPrice: Number(milesPrice ?? 0),
        origin,
        destination,
        departureDate,
        returnDate
    }, {transaction});
};

export const createHotelComponent = async (componentData, transaction = null) => {
    const { checkin, checkout, name, description, amadeusId, moneyPrice, milesPrice } = componentData;
    
    return await PackageComponents.create({
        packageId: componentData.packageId,
        type: 'HOTEL',
        name: name || `Hotel stay from ${checkin} to ${checkout}`,
        description: description || `Estadia de ${checkin} a ${checkout}`,
        amadeusId,
        moneyPrice: Number(moneyPrice ?? 0),
        milesPrice: Number(milesPrice ?? 0),
        checkin,
        checkout
    }, {transaction});
};

export const createActivityComponent = async (componentData, transaction = null) => {
    const { description, amadeusId, moneyPrice, milesPrice, destination } = componentData;
    return await PackageComponents.create({
        packageId: componentData.packageId,
        name: `Activity in ${destination}`,
        type: 'ACTIVITY',
        description,
        amadeusId,
        moneyPrice: Number(moneyPrice ?? 0),
        milesPrice: Number(milesPrice ?? 0),
        destination,
    }, {transaction});
};

export const createCarRentalComponent = async (componentData, transaction = null) => {
    const {description, amadeusId, moneyPrice, milesPrice, destination} = componentData;
    return await PackageComponents.create({
        packageId: componentData.packageId,
        name: `Car rental in ${destination}`,
        type: 'CAR_RENTAL',
        description,
        amadeusId,
        moneyPrice: Number(moneyPrice ?? 0),
        milesPrice: Number(milesPrice ?? 0),
        destination,
    }, {transaction});
};
