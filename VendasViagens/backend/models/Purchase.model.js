import { Model } from "sequelize";

class Purchase extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            userId: { type: DataTypes.INTEGER, allowNull: false },
            travelPackageId: { type: DataTypes.INTEGER, allowNull: false },
            status: { type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED'), defaultValue: 'PENDING' },
            quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
            totalMoneyPrice: { type: DataTypes.DECIMAL(10, 2) },
            totalMilesPrice: { type: DataTypes.DECIMAL(10, 2) },
            paidInMoney: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
            paidInMiles: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
            purchaseDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },

        }, {
            sequelize,
            modelName: 'Purchase',
            tableName: 'purchases',
            hooks: {
                beforeCreate: async (purchase, options) => {
                    const travelPackage = await sequelize.models.TravelPackage.findByPk(
                        purchase.travelPackageId, 
                        { transaction: options.transaction }
                    );
                    if (travelPackage) {
                        purchase.totalMoneyPrice = travelPackage.totalMoneyPrice * purchase.quantity;
                        purchase.totalMilesPrice = travelPackage.totalMilesPrice * purchase.quantity;
                        
                  
                    }
                }
            }
        });
    }
}

export default function (sequelize, DataTypes) {
    Purchase.init(sequelize, DataTypes);
    return Purchase;
}