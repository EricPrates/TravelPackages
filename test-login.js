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

async function testLogin() {
    try {
        await sequelize.authenticate();
        
        const email = 'eric@test.com';
        const password = '123456';
        
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            console.log(`❌ Usuário ${email} não encontrado!`);
            return;
        }
        
        console.log(`✅ Usuário encontrado: ${user.name}`);
        console.log(`📧 Email: ${user.email}`);
        console.log(`🔑 Hash da senha: ${user.password.substring(0, 30)}...`);
        
        const isValid = await bcrypt.compare(password, user.password);
        console.log(`\n🔐 Testando senha "${password}": ${isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
        
        if (!isValid) {
            console.log('\n🔧 Resetando senha novamente...');
            const newHash = await bcrypt.hash(password, 10);
            await user.update({ password: newHash });
            console.log('✅ Senha resetada com sucesso!');
            
            const testAgain = await bcrypt.compare(password, newHash);
            console.log(`🔐 Teste após reset: ${testAgain ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

testLogin();
