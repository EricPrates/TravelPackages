import { Model } from "sequelize";

class Purchase extends Model {
static init(sequelize, DataTypes) {
    return super.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    travel_package_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { 
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
        defaultValue: 'pending'
    },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    total_price: { type: DataTypes.DECIMAL(10,2) },
    purchase_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    
},{
            sequelize,
            modelName: 'Purchase',
            tableName: 'purchases'
        });
}
}

export default function(sequelize, DataTypes) {
    Purchase.init(sequelize, DataTypes);
    return Purchase;
}