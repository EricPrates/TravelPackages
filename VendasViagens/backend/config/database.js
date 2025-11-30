export default{
    dialect: 'sqlite',
    storage: process.env.NODE_ENV === 'production' 
        ? '/opt/render/project/src/db/travel_packages.db'
        : './db/travel_packages.db',
    logging: false
}