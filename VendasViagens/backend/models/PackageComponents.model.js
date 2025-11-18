import { ENUM } from "sequelize";
import {Model} from "sequelize";

class PackageComponents extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
            title: {
            type: DataTypes.STRING,
            allowNull: false
            },
            type:{
            type: DataTypes.ENUM('FLIGHT', 'HOTEL', 'ACTIVITY', 'CAR_RENTAL'),
            allowNull: false
        },

        componentName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        AmadeusId : {
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
            allowNull: true,
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
    },{
        sequelize,
        modelName: 'PackageComponents',
        tableName: 'package_components'
    })


};
}

export default function(sequelize, DataTypes) {
    PackageComponents.init(sequelize, DataTypes);
    return PackageComponents;
}
