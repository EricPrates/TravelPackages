const travelPackageModel = (sequelize, DataTypes) => {
    const TravelPackage = sequelize.define('travel_package', {
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
        image:{
            type: DataTypes.STRING,
            allowNull: true
        },
        totalPrice:{
            type: DataTypes.FLOAT,
            allowNull: true
        }
    });

    return TravelPackage;
};

export default travelPackageModel;
