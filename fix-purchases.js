import db from './models/index.js';

async function fixPurchases() {
    try {
        const purchases = await db.Purchase.findAll();
        
        console.log('🔧 Corrigindo compras...\n');
        
        for (const purchase of purchases) {
            const needsUpdate = !purchase.paidInMoney && !purchase.paidInMiles;
            
            if (needsUpdate) {
                await purchase.update({
                    paidInMoney: purchase.totalMoneyPrice || 0,
                    paidInMiles: purchase.totalMilesPrice || 0
                });
                console.log(`✅ Compra #${purchase.id} atualizada`);
            }
        }
        
        console.log('\n✅ Todas as compras foram corrigidas!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

fixPurchases();
