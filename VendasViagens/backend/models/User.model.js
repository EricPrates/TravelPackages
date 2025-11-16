import {Model} from "sequelize";

class User extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
        name: {
                type: DataTypes.STRING,
            allowNull: true
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
        balanciInCash: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0.0
        },
        balanceInMiles:{
            type:DataTypes.INTEGER,
            allowNull:false,
            defaultValue:0
        }},
           { 
            sequelize,
            modelName: 'User',
            tableName: 'users'
        });

    }


}

export default function(sequelize, DataTypes) {
    User.init(sequelize, DataTypes);
    return User;
}
