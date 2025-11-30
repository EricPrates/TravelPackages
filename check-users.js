import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './VendasViagens/backend/db/travel_packages.db',
    logging: false
});

const User = sequelize.define('User', {
    id: { type: Sequelize.INTEGER, primaryKey: true },
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    password: Sequelize.STRING,
    role: Sequelize.STRING
}, { tableName: 'users' });

async function checkUsers() {
    const users = await User.findAll();
    console.log('\n=== USUÁRIOS NO BANCO ===\n');
    users.forEach(u => {
        console.log(`ID: ${u.id}`);
        console.log(`Nome: ${u.name}`);
        console.log(`Email: ${u.email}`);
        console.log(`Role: ${u.role}`);
        console.log(`Senha (hash): ${u.password.substring(0, 20)}...`);
        console.log('---');
    });
    process.exit(0);
}

checkUsers();
