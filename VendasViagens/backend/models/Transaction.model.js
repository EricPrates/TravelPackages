import {Model} from "sequelize";

class Transaction extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
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
                allowNull: false  
            },
            coinType: {
                type: DataTypes.ENUM('CASH', 'MILES'),
                allowNull: false
            },
            amount:{
                type: DataTypes.DECIMAL(10,2),
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
            }
        },{
            sequelize,
            modelName: 'Transaction',
            tableName: 'transactions'
        });
}
}

export default function(sequelize, DataTypes) {
    Transaction.init(sequelize, DataTypes);
    return Transaction;
}