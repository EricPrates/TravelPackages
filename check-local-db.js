import Database from 'better-sqlite3';

const db = new Database('./VendasViagens/backend/db/travel_packages.db', { readonly: true });

console.log('\n=== USUÁRIOS NO BANCO LOCAL ===\n');

const users = db.prepare('SELECT id, name, email, password, role FROM users').all();

users.forEach(user => {
    console.log(`ID: ${user.id}`);
    console.log(`Nome: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Hash: ${user.password}`);
    console.log('---\n');
});

db.close();
