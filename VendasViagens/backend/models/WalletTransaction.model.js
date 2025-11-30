import { Model } from "sequelize";

class WalletTransaction extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            walletId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'wallets',
                    key: 'id'
                }
            },
            type: {
                type: DataTypes.ENUM('DEPOSIT', 'WITHDRAWAL', 'PURCHASE'),
                allowNull: false
            },
            coinType: {
                type: DataTypes.ENUM('CASH', 'MILES'),
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
            relatedPurchaseId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'purchases',
                    key: 'id'
                }
            },
            date: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        }, {
            sequelize,
            modelName: 'WalletTransaction',
            tableName: 'wallet_transactions',
            timestamps: true
        });
    }
}

export default function (sequelize, DataTypes) {
    WalletTransaction.init(sequelize, DataTypes);
    return WalletTransaction;
}