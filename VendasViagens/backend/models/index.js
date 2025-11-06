import DbConfig from "../config/database.js";
import Sequelize from "sequelize";
import packageComponentsModel from "./PackageComponents.model.js";
import travelPackageModel from "./travelPackage.model.js";
import UserModel from "./User.model.js";

const sequelize = new Sequelize({
    dialect: DbConfig.dialect,
    storage: DbConfig.storage,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Users = UserModel(sequelize, Sequelize.DataTypes);
db.TravelPackage = travelPackageModel(sequelize, Sequelize.DataTypes);
db.PackageComponents = packageComponentsModel(sequelize, Sequelize.DataTypes);

db.Users.belongsToMany(db.TravelPackage, { through: 'UserTravelPackages', as: 'bookedPackages', foreignKey: 'userId' });
db.TravelPackage.belongsToMany(db.Users, { through: 'UserTravelPackages', as: 'users', foreignKey: 'packageId' });
db.TravelPackage.hasMany(db.PackageComponents, { foreignKey: 'packageId', as: 'components' });
db.PackageComponents.belongsTo(db.TravelPackage, { foreignKey: 'packageId', as: 'travelPackage' });

export default db;