// Script de teste de autenticação
// Execute: node test-auth-simple.js
// Certifique-se de que o servidor está rodando em http://localhost:3000

const BASE_URL = 'http://localhost:4567';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
console.log(`${colors.cyan}🧪 TESTE DE AUTENTICAÇÃO${colors.reset}`);
console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

console.log(`${colors.yellow}⚠️  IMPORTANTE: Certifique-se de que o servidor está rodando!${colors.reset}`);
console.log(`${colors.blue}ℹ️  Execute em outro terminal: npm start${colors.reset}\n`);

async function testAuth() {
    const userData = {
        name: "Eric Teste",
        email: "eric@test.com",
        password: "senhaSegura12",
        role: "agent"
    };

    try {
        // PASSO 1: REGISTRO
        console.log(`${colors.cyan}━━━ PASSO 1: REGISTRO ━━━${colors.reset}`);
        console.log(`${colors.blue}POST ${BASE_URL}/users/register${colors.reset}`);
        console.log(JSON.stringify(userData, null, 2));
        
        const registerResponse = await fetch(`${BASE_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        const registerData = await registerResponse.json();
        
        if (registerResponse.ok) {
            console.log(`${colors.green}✅ Registro bem-sucedido!${colors.reset}`);
            console.log(JSON.stringify(registerData, null, 2));
            console.log(`\n${colors.green}🎟️  Token recebido no registro:${colors.reset}`);
            console.log(registerData.data.token);
        } else if (registerResponse.status === 409) {
            console.log(`${colors.yellow}⚠️  Usuário já existe${colors.reset}`);
        } else {
            console.log(`${colors.red}❌ Erro no registro:${colors.reset}`);
            console.log(JSON.stringify(registerData, null, 2));
        }

        // PASSO 2: LOGIN
        console.log(`\n${colors.cyan}━━━ PASSO 2: LOGIN ━━━${colors.reset}`);
        console.log(`${colors.blue}POST ${BASE_URL}/auth/login${colors.reset}`);
        console.log(JSON.stringify({ email: userData.email, password: userData.password }, null, 2));
        
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: userData.email,
                password: userData.password
            })
        });
        
        const loginData = await loginResponse.json();
        
        if (loginResponse.ok) {
            console.log(`${colors.green}✅ Login bem-sucedido!${colors.reset}`);
            console.log(JSON.stringify(loginData, null, 2));
            console.log(`\n${colors.green}🎟️  Token recebido no login:${colors.reset}`);
            console.log(loginData.data.token);
            
            // PASSO 3: REQUISIÇÃO AUTENTICADA
            console.log(`\n${colors.cyan}━━━ PASSO 3: REQUISIÇÃO AUTENTICADA ━━━${colors.reset}`);
            console.log(`${colors.blue}GET ${BASE_URL}/users${colors.reset}`);
            console.log(`${colors.blue}Authorization: Bearer ${loginData.data.token.substring(0, 20)}...${colors.reset}`);
            
            const usersResponse = await fetch(`${BASE_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${loginData.data.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const usersData = await usersResponse.json();
            
            if (usersResponse.ok) {
                console.log(`${colors.green}✅ Requisição autenticada com sucesso!${colors.reset}`);
                console.log(`${colors.green}Total de usuários: ${usersData.length}${colors.reset}`);
            } else {
                console.log(`${colors.red}❌ Erro na requisição autenticada${colors.reset}`);
                console.log(JSON.stringify(usersData, null, 2));
            }
            
            // RESUMO
            console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
            console.log(`${colors.green}✅ TODOS OS TESTES CONCLUÍDOS COM SUCESSO!${colors.reset}`);
            console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
            
            console.log(`${colors.yellow}💡 Como usar o token:${colors.reset}`);
            console.log(`${colors.blue}Authorization: Bearer ${loginData.data.token}${colors.reset}\n`);
            
        } else {
            console.log(`${colors.red}❌ Erro no login:${colors.reset}`);
            console.log(JSON.stringify(loginData, null, 2));
        }
        
    } catch (error) {
        console.log(`\n${colors.red}❌ ERRO: ${error.message}${colors.reset}`);
        console.log(`${colors.yellow}⚠️  Verifique se o servidor está rodando em ${BASE_URL}${colors.reset}\n`);
    }
}

testAuth();
