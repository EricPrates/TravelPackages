import { ENUM } from "sequelize";

const packageComponentsModel = (sequelize, DataTypes) => {
    const PackageComponents = sequelize.define('package_components', {
        type:{
            type: DataTypes.ENUM('FLIGHT', 'HOTEL', 'TOUR',  'MEAL'),
            allowNull: false
        },

        componentType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        componentName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        componentPrice: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        packageId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    });

    return PackageComponents;
};

export default packageComponentsModel;
