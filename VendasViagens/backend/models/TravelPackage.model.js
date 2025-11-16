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
            price: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            duration: {
                type: DataTypes.INTEGER,
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
            image: {
                type: DataTypes.STRING,
                allowNull: true
            },
        }, {  
            sequelize,
            modelName: 'TravelPackage', 
            tableName: 'travel_packages' 
        });
    }

    calculateTotalPrice() {
        const components = this.components || [];
        return components.reduce((total, component) => {
            return total + (component.calculateTotalPrice?.() || component.price || 0);
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