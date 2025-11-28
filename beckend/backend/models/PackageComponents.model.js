import { Model } from "sequelize";

class PackageComponents extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            packageId: { 
                type: DataTypes.INTEGER, 
                allowNull: false,
                references: {
                    model: 'travel_packages',
                    key: 'id'
                }
            },
            type: { 
                type: DataTypes.ENUM('FLIGHT','HOTEL','ACTIVITY','CAR_RENTAL'), 
                allowNull: false 
            },
            name: { type: DataTypes.STRING, allowNull: false },
            description: { type: DataTypes.TEXT, allowNull: true },
            amadeusId: { type: DataTypes.STRING, allowNull: true },
            moneyPrice: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
            milesPrice: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            // Campos específicos para FLIGHT
            origin: { type: DataTypes.STRING, allowNull: true },
            destination: { type: DataTypes.STRING, allowNull: true },
            departureDate: { type: DataTypes.DATE, allowNull: true },
            returnDate: { type: DataTypes.DATE, allowNull: true },
            // Campos específicos para HOTEL
            checkin: { type: DataTypes.DATE, allowNull: true },
            checkout: { type: DataTypes.DATE, allowNull: true }
        }, {
            sequelize,
            modelName: 'PackageComponents',
            tableName: 'package_components'
        });
    }
}

export default function(sequelize, DataTypes) {
    PackageComponents.init(sequelize, DataTypes);
    return PackageComponents;
}

 
