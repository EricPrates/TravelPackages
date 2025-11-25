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
            type: {
                type: DataTypes.ENUM(
                    'DEPOSIT',
                    'WITHDRAWAL',
                    'PURCHASE'
                ),
                allowNull: false
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references:{
                    model: "users",
                    key:'id'
                }
            },
            miles: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            cash: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            amount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true
            },
            date: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                }
            }
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