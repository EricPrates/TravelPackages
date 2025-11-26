import { Model } from "sequelize";

class Wallet extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,      
                autoIncrement: true,
                allowNull: false
            },
           
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: true,
                references:{
                    model: "users",
                    key:'id'
                }
            },
            balanceInCash: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.00
            },
            balanceInMiles: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.00
            },
          
        }, {
            sequelize,
            modelName: 'Wallet',
            tableName: 'wallets'
        });
    }
}

export default function (sequelize, DataTypes) {
    Wallet.init(sequelize, DataTypes);
    return Wallet;
}