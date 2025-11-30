import bcrypt from 'bcrypt';
import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'db/travel_packages.db'),
    logging: false
});

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    password: DataTypes.STRING,
    role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
    googleId: DataTypes.STRING
}, { tableName: 'users' });

async function createUser() {
    try {
        await sequelize.authenticate();
        
        const name = 'Eric Novo';
        const email = 'eric@novo.com';
        const password = '123456';
        const role = 'admin';
        
        // Verificar se já existe
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            console.log(`⚠️  Usuário ${email} já existe. Resetando senha...`);
            const hashedPassword = await bcrypt.hash(password, 10);
            await existing.update({ password: hashedPassword });
            console.log(`✅ Senha resetada!`);
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.create({
                name,
                email,
                password: hashedPassword,
                role
            });
            console.log(`✅ Usuário criado com sucesso!`);
        }
        
        console.log(`\n📧 Email: ${email}`);
        console.log(`🔑 Senha: ${password}`);
        console.log(`👤 Role: ${role}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

createUser();
