import { ENUM } from "sequelize";

const packageComponentsModel = (sequelize, DataTypes) => {
    const PackageComponents = sequelize.define('package_components', {
        type:{
            type: ENUM('FLIGHT', 'HOTEL', 'TOUR',  'MEAL'),
            allowNull: false
        },

        componentType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        componentName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        componentPrice: {
            type: DataTypes.FLOAT,
            allowNull: false
        }
    });

    return PackageComponents;
};

export default packageComponentsModel;
