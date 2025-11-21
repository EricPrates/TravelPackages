import { ENUM } from "sequelize";
import {Model} from "sequelize";

class PackageComponents extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      packageId: { type: DataTypes.INTEGER, allowNull: false },
      type: { type: DataTypes.ENUM('FLIGHT','HOTEL','ACTIVITY','CAR_RENTAL'), allowNull: true },
      amadeusId: { type: DataTypes.STRING, allowNull: true },
      moneyPrice: { type: DataTypes.FLOAT, allowNull: true },
      milesPrice: { type: DataTypes.INTEGER, allowNull: true },
      departureDate: { type: DataTypes.DATE, allowNull: true },
      returnDate: { type: DataTypes.DATE, allowNull: true },
      checkin: { type: DataTypes.DATE, allowNull: true },
      checkout: { type: DataTypes.DATE, allowNull: true },
      origin: { type: DataTypes.STRING, allowNull: true },
      destination: { type: DataTypes.STRING, allowNull: true },
      numberOfTravelers: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 1 },
      title: { type: DataTypes.STRING, allowNull: true },
      componentName: { type: DataTypes.STRING, allowNull: true },
      AmadeusId: { type: DataTypes.STRING, allowNull: true },
      checkinDate: { type: DataTypes.DATE, allowNull: true },
      checkoutDate: { type: DataTypes.DATE, allowNull: true }      
        
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
