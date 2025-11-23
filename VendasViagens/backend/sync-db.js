import db from './models/index.js';

(async () => {
    try {
        console.log('🔄 Sincronizando banco de dados...\n');
        await db.sequelize.sync({ alter: true });
        console.log('✅ Banco sincronizado com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
})();
