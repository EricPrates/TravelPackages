const userModel = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false
        },
        cash: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0.0
        },
        miles:{
            type:DataTypes.INTEGER,
            allowNull:false,
            defaultValue:0
        }
    });

    return User;
};

export default userModel;
