import { Model } from "sequelize";

class TravelPackage extends Model {
    static init(sequelize, DataTypes) {
        return super.init({

            id: { 
                type: DataTypes.INTEGER, 
                primaryKey: true, 
                autoIncrement: true, 
                allowNull: false 
            },
            agentId: { 
                type: DataTypes.INTEGER, 
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            title: { type: DataTypes.STRING, allowNull: false },
            destination: { type: DataTypes.STRING, allowNull: false },
            origin: { type: DataTypes.STRING, allowNull: false },
            departureDate: { type: DataTypes.DATE, allowNull: false },
            returnDate: { type: DataTypes.DATE, allowNull: false },
            description: { type: DataTypes.TEXT, allowNull: true },
            numberOfTravelers: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
            availableSlots: { type: DataTypes.INTEGER, allowNull: false },
            totalMilesPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
            totalMoneyPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
            status: { 
                type: DataTypes.ENUM('AVAILABLE', 'CONFIRMED', 'CANCELLED', 'REFUNDED'), 
                defaultValue: 'AVAILABLE', 
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
            tableName: 'travel_packages',
              hooks: {
                afterFind: (packages) => {
                    if (!packages) return;
                    
                    if (Array.isArray(packages)) {
                        packages.forEach(pkg => pkg.calculatePrices());
                    } else {
                        packages.calculatePrices();
                    }
                }
              }
    });
}

     calculatePrices() {
        const components = this.components || [];
        
        this.totalMoneyPrice = components.reduce((total, component) => {
            return total + (component.moneyPrice || component.price || 0);
        }, 0);
        
        this.totalMilesPrice = components.reduce((total, component) => {
            return total + (component.milesPrice || 0);
        }, 0);
        
        return this;
    }

    
    isAvailable() {
        return this.status === 'AVAILABLE' && this.availableSlots > 0;
    }

 
    reserveSlots(quantity = 1) {
        if (this.availableSlots >= quantity) {
            this.availableSlots -= quantity;
            return true;
        }
        return false;
    }

    
    getDurationInDays() {
        if (!this.departureDate || !this.returnDate) return 0;
        const diffTime = Math.abs(this.returnDate - this.departureDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}

export default function (sequelize, DataTypes) {
    TravelPackage.init(sequelize, DataTypes);
    return TravelPackage;
}