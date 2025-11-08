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
            type: DataTypes.ENUM('FLIGHT', 'HOTEL', 'TOUR',  'MEAL', 'TRANSPORT', 'ACTIVITY', 'INSURANCE'),
            allowNull: false
        },

        componentName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        moneyPrice: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        milesPrice: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        packageId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }
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
