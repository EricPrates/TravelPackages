import { Model } from "sequelize";

class User extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            
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
            googleId: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true
            }
        },
            {
                sequelize,
                modelName: 'User',
                tableName: 'users'
            });

    }


}

export default function (sequelize, DataTypes) {
    User.init(sequelize, DataTypes);
    return User;
}
