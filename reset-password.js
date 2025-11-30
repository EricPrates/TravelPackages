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
    role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' }
}, { tableName: 'users' });

async function resetPassword() {
    try {
        await sequelize.authenticate();
        
        const email = 'eric@test.com';
        const newPassword = '123456';
        
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            console.log(`❌ Usuário ${email} não encontrado!`);
            console.log('\n📋 Listando todos os usuários:');
            const allUsers = await User.findAll();
            allUsers.forEach(u => console.log(`  - ${u.email} (${u.name})`));
        } else {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await user.update({ password: hashedPassword });
            console.log(`✅ Senha do usuário ${email} resetada para: ${newPassword}`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

resetPassword();
