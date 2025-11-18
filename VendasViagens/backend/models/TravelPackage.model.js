import { Model } from "sequelize";

class TravelPackage extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            destination: {
                type: DataTypes.STRING,
                allowNull: false
            },
            origin: {
                type: DataTypes.STRING,
                allowNull: false
            },
            departureDate: {
                type: DataTypes.DATE,
                allowNull: false
            },
            returnDate: {
                type: DataTypes.DATE,
                allowNull: false
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            availableSlots: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            images: {
                type: DataTypes.TEXT,
                allowNull: true,
                defaultValue: '[]',
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

    calculateMilesPrice() {
        const components = this.components || [];
        return components.reduce((total, component) => {
            return total + (component.milesPrice || 0);
        }, 0);
    }

    
}

    


export default function(sequelize, DataTypes) {
    TravelPackage.init(sequelize, DataTypes);
    return TravelPackage;
}