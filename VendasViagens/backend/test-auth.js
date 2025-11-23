const BASE_URL = 'http://localhost:3000';

// Cores para o console
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(50)}\n${msg}\n${'='.repeat(50)}${colors.reset}\n`)
};

async function testRegister() {
    log.section('TESTE DE REGISTRO');
    
    const userData = {
        name: "Eric Teste",
        email: "eric@test.com",
        password: "senhaSegura12",
        role: "agent"
    };
    
    log.info(`Registrando usuário: ${userData.email}`);
    console.log('Dados:', JSON.stringify(userData, null, 2));
    
    try {
        const response = await fetch(`${BASE_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            log.success('Usuário registrado com sucesso!');
            console.log('Resposta:', JSON.stringify(data, null, 2));
            return data;
        } else {
            if (response.status === 409) {
                log.warning('Usuário já existe, tentando fazer login...');
                return null;
            }
            log.error(`Erro no registro: ${response.status}`);
            console.log('Resposta:', JSON.stringify(data, null, 2));
            return null;
        }
    } catch (error) {
        log.error(`Erro na requisição: ${error.message}`);
        return null;
    }
}

async function testLogin() {
    log.section('TESTE DE LOGIN');
    
    const credentials = {
        email: "eric@test.com",
        password: "senhaSegura12"
    };
    
    log.info(`Fazendo login com: ${credentials.email}`);
    console.log('Credenciais:', JSON.stringify(credentials, null, 2));
    
    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            log.success('Login realizado com sucesso!');
            console.log('Resposta:', JSON.stringify(data, null, 2));
            return data;
        } else {
            log.error(`Erro no login: ${response.status}`);
            console.log('Resposta:', JSON.stringify(data, null, 2));
            return null;
        }
    } catch (error) {
        log.error(`Erro na requisição: ${error.message}`);
        return null;
    }
}

async function testAuthenticatedRequest(token) {
    log.section('TESTE DE REQUISIÇÃO AUTENTICADA');
    
    log.info('Buscando dados do usuário com token...');
    
    try {
        const response = await fetch(`${BASE_URL}/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            log.success('Requisição autenticada com sucesso!');
            console.log(`Total de usuários: ${data.length}`);
            return data;
        } else {
            log.error(`Erro na requisição: ${response.status}`);
            console.log('Resposta:', JSON.stringify(data, null, 2));
            return null;
        }
    } catch (error) {
        log.error(`Erro na requisição: ${error.message}`);
        return null;
    }
}

async function runTests() {
    console.log('\n🚀 Iniciando testes de autenticação...\n');
    
    // Teste 1: Registro
    const registerResult = await testRegister();
    
    // Teste 2: Login
    const loginResult = await testLogin();
    
    if (loginResult && loginResult.data && loginResult.data.token) {
        // Teste 3: Requisição autenticada
        await testAuthenticatedRequest(loginResult.data.token);
        
        log.section('RESUMO');
        log.success('Todos os testes foram executados!');
        console.log('\n📋 Token gerado:');
        console.log(loginResult.data.token);
        console.log('\n💡 Use este token no header Authorization: Bearer <token>');
    } else {
        log.section('RESUMO');
        log.error('Falha ao obter token de autenticação');
    }
}

// Executar testes
runTests().catch(error => {
    log.error(`Erro fatal: ${error.message}`);
    process.exit(1);
});
