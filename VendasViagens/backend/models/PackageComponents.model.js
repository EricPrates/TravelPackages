import { ENUM } from "sequelize";
import { Model } from "sequelize";

class PackageComponents extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            type: {
                type: DataTypes.ENUM('FLIGHT', 'HOTEL', 'ACTIVITY', 'CAR_RENTAL'),
                allowNull: false
            },

            name: {
                type: DataTypes.STRING,
                allowNull: true
            },
            AmadeusId: {
                type: DataTypes.STRING,
                allowNull: true
            },
            moneyPrice: {
                type: DataTypes.FLOAT,
                allowNull: true
            },
            milesPrice: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            packageId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'travel_packages',  // ← Tabela que ele referencia
                    key: 'id'                   // ← Campo que ele referencia (a PK)
                }
            },
            departureDate: {
                type: DataTypes.DATE,
                allowNull: true
            },
            returnDate: {
                type: DataTypes.DATE,
                allowNull: true
            },
            origin: {
                type: DataTypes.STRING,
                allowNull: true
            },
            destination: {
                type: DataTypes.STRING,
                allowNull: true
            },
            numberOfTravelers: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 1
            },
            checkInDate: {
                type: DataTypes.DATE,
                allowNull: true
            },
            checkOutDate: {
                type: DataTypes.DATE,
                allowNull: true
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true
            },
            packageId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'travel_packages',
                    key: 'id'
                }
            }


        }, {
            sequelize,
            modelName: 'PackageComponents',
            tableName: 'package_components'
        })


    };
}

export default function (sequelize, DataTypes) {
    PackageComponents.init(sequelize, DataTypes);
    return PackageComponents;
}
