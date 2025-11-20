import DbConfig from "../config/database.js";
import {Sequelize} from "sequelize";
import packageComponentsModel from "./PackageComponents.model.js";
import travelPackageModel from "./TravelPackage.model.js";
import UserModel from "./User.model.js";
import transactionsModel from "./Transaction.model.js";

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
db.Transactions = transactionsModel(sequelize, Sequelize.DataTypes);

db.Users.belongsToMany(db.TravelPackage, { through: 'UserTravelPackages', 
as: 'bookedPackages', foreignKey: 'userId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

db.TravelPackage.belongsToMany(db.Users, { through: 'UserTravelPackages', 
as: 'users', foreignKey: 'packageId', onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

db.TravelPackage.hasMany(db.PackageComponents, { foreignKey: 'packageId', 
as: 'components', onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

db.PackageComponents.belongsTo(db.TravelPackage, { foreignKey: 'packageId', 
as: 'travelPackage', onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

db.Transactions.belongsTo(db.Users, { foreignKey: 'userId', 
as: 'user', onDelete: 'CASCADE', onUpdate: 'CASCADE'  });

db.Users.hasMany(db.Transactions, { foreignKey: 'userId', 
as: 'transactions', onDelete: 'CASCADE', onUpdate: 'CASCADE'  });
db.TravelPackage.belongsTo(db.Users, { 
    foreignKey: 'agentId', 
    as: 'agent',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});

db.Users.hasMany(db.TravelPackage, { 
    foreignKey: 'agentId', 
    as: 'createdPackages',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});

export default db;