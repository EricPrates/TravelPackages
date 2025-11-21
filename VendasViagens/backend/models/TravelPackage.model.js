import { Model } from "sequelize";

class TravelPackage extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
            
            id: {type: DataTypes.INTEGER, primaryKey: true,autoIncrement: true, allowNull: false },
            agentId: {type: DataTypes.INTEGER,allowNull: false,references: {model: 'users',key: 'id'},},
            title: {type: DataTypes.STRING, allowNull: true},
            destination: {type: DataTypes.STRING, allowNull: false},
            origin: {type: DataTypes.STRING, allowNull: false},
            departureDate: {type: DataTypes.DATE, allowNull: false},
            returnDate: {type: DataTypes.DATE, allowNull: false},
            description: {type: DataTypes.TEXT, allowNull: true},
            availableSlots: {type: DataTypes.INTEGER,allowNull: false},
            status: {type: DataTypes.ENUM('AVAILABLE', 'CONFIRMED', 'CANCELLED', 'REFUNDED'),defaultValue: 'AVAILABLE',allowNull: true},
            purchaseDate: {type: DataTypes.DATE,allowNull: true,defaultValue: DataTypes.NOW},
            numberOfTravelers: {type: DataTypes.INTEGER,allowNull: true,defaultValue: 1},
            images: {type: DataTypes.TEXT, allowNull: true, defaultValue: '[]',
                get() {
                    const rawValue = this.getDataValue('images');
                    return rawValue ? JSON.parse(rawValue) : [];
                },
                set(value) {
                    this.setDataValue('images', JSON.stringify(value));
                }
            },
        }, {
            sequelize,
            modelName: 'TravelPackage',
            tableName: 'travel_packages'
        });
    }

    calculateTotalPriceMiles() {
        const components = this.components || [];
        return components.reduce((total, component) => {
            return total + (component.calculateTotalPriceMiles?.() || component.priceMiles || 0);
        }, 0);
    }

    calculateMoneyPrice() {
        const components = this.components || [];
        return components.reduce((total, component) => {
            return total + (component.moneyPrice || 0);
        }, 0);
    }



}




export default function (sequelize, DataTypes) {
    TravelPackage.init(sequelize, DataTypes);
    return TravelPackage;
}