// backend/services/myServices/packageComponents/Factory.Service.js

import db from '../../../models/index.js';
import {
    createFlightComponent,
    createActivityComponent,
    createHotelComponent,
    createCarRentalComponent,
    updatePackageTotals
} from './BaseComponent.Service.js';

const TravelPackage = db.TravelPackage;

export const createComponent = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      
        const { type, packageId, ...componentData } = req.body;
        
      
        if (!type) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Campo "type" é obrigatório (FLIGHT, HOTEL, ACTIVITY, CAR_RENTAL)'
            });
        }
        
        if (!packageId) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Campo "packageId" é obrigatório'
            });
        }
        
       
        const travelPackage = await TravelPackage.findByPk(packageId, { transaction });
        if (!travelPackage) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Pacote de viagem não encontrado'
            });
        }
        

        if (travelPackage.agentId !== req.user.id) {
            await transaction.rollback();
            return res.status(403).json({
                success: false,
                message: 'Você não tem permissão para adicionar componentes a este pacote'
            });
        }
        
   
        const componentDataWithPackage = {
            ...componentData,
            packageId  
        };
        
     
        let newComponent;
        switch (type.toUpperCase()) {
            case 'FLIGHT':
                newComponent = await createFlightComponent(componentDataWithPackage, transaction);
                break;
            case 'HOTEL':
                newComponent = await createHotelComponent(componentDataWithPackage, transaction);
                break;
            case 'ACTIVITY':
                newComponent = await createActivityComponent(componentDataWithPackage, transaction);
                break;
            case 'CAR_RENTAL':
                newComponent = await createCarRentalComponent(componentDataWithPackage, transaction);
                break;
            default:
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Tipo de componente inválido: "${type}". Use: FLIGHT, HOTEL, ACTIVITY, CAR_RENTAL`
                });
        }
        

        const totals = await updatePackageTotals(packageId, transaction);
        
        await transaction.commit();
        
        return res.status(201).json({
            success: true,
            message: 'Componente criado com sucesso',
            data: {
                component: newComponent,
                packageTotals: totals
            }
        });
        
    } catch (error) {
        await transaction.rollback();
        console.error('Erro ao criar componente:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao criar componente do pacote',
            error: error.message
        });
    }
};

//criar em batch
export const createComponents = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
        const { packageId, components } = req.body;

        if (!packageId) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Campo "packageId" é obrigatório'
            });
        }
        
        if (!Array.isArray(components) || components.length === 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Campo "components" deve ser um array não vazio'
            });
        }
        

        const travelPackage = await TravelPackage.findByPk(packageId, { transaction });
        if (!travelPackage) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Pacote não encontrado'
            });
        }
        
      
        if (travelPackage.agentId !== req.user.id) {
            await transaction.rollback();
            return res.status(403).json({
                success: false,
                message: 'Sem permissão para modificar este pacote'
            });
        }
        
 
        const created = [];
        const errors = [];
        
        for (let i = 0; i < components.length; i++) {
            const comp = components[i];
            
            try {
                const dataWithPackage = { ...comp, packageId };
                let newComponent;
                
                switch (comp.type?.toUpperCase()) {
                    case 'FLIGHT':
                        newComponent = await createFlightComponent(dataWithPackage, transaction);
                        break;
                    case 'HOTEL':
                        newComponent = await createHotelComponent(dataWithPackage, transaction);
                        break;
                    case 'ACTIVITY':
                        newComponent = await createActivityComponent(dataWithPackage, transaction);
                        break;
                    case 'CAR_RENTAL':
                        newComponent = await createCarRentalComponent(dataWithPackage, transaction);
                        break;
                    default:
                        errors.push({
                            index: i,
                            type: comp.type,
                            error: 'Tipo inválido'
                        });
                        continue;
                }
                
                created.push(newComponent);
                
            } catch (error) {
                errors.push({
                    index: i,
                    type: comp.type,
                    error: error.message
                });
            }
        }
        
        // Se nenhum foi criado, para e apaga tudo
        if (created.length === 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Nenhum componente foi criado',
                errors
            });
        }
        
     
        const totals = await updatePackageTotals(packageId, transaction);
        
        await transaction.commit();
        
        return res.status(201).json({
            success: true,
            message: `${created.length} componente(s) criado(s) com sucesso`,
            data: {
                componentsCreated: created.length,
                components: created,
                packageTotals: totals
            },
            ...(errors.length > 0 && {
                warnings: `${errors.length} componente(s) falharam`,
                errors
            })
        });
        
    } catch (error) {
        await transaction.rollback();
        console.error('Erro ao criar componentes:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao criar componentes',
            error: error.message
        });
    }
};
