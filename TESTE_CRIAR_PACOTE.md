# 🧪 Teste de Criação de Pacote

## 📊 Dados Enviados pelo Frontend:

```json
{
  "departureDate": "2025-12-30",
  "description": "Jsjsbd",
  "destination": "Paris",
  "numberOfTravelers": 1,
  "origin": "Rio de Janeiro ",
  "returnDate": "2026-01-30",
  "title": "Rio de Janeiro "
}
```

## ❌ Erro Recebido:

```
Response: 500 false
```

---

## 🔍 Possíveis Causas do Erro 500:

### 1. **Banco de dados não sincronizado**
O campo `availableSlots` pode não existir na tabela.

**Solução:**
```bash
# Conectar no servidor
ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219

# Ver logs do PM2
pm2 logs vendasviagens --lines 50

# Reiniciar com sync do banco
cd ~/trabalho2/beckend
pm2 stop vendasviagens
pm2 start backend/server.js --name vendasviagens
pm2 logs vendasviagens
```

### 2. **Campo obrigatório faltando**
O model pode ter campos obrigatórios que não estão sendo enviados.

**Verificar no model:**
```javascript
// beckend/backend/models/TravelPackage.model.js
availableSlots: { 
    type: DataTypes.INTEGER, 
    allowNull: false  // ← Se for false, é obrigatório
}
```

### 3. **Validação de data falhando**
A função `validatePackageData` pode estar retornando erro.

### 4. **Token inválido ou expirado**
O `req.user.id` pode estar undefined.

---

## 🔧 Como Debugar:

### Opção 1: Ver logs do servidor

```bash
ssh -i ~/Aws_vianna_2025_teste.pem ubuntu@44.219.93.219
pm2 logs vendasviagens --lines 100
```

Procure por:
```
❌ Erro ao buscar pacotes: ...
Erro em createBasePackage: ...
```

### Opção 2: Testar direto na API

```bash
# Pegar o token do usuário
TOKEN="seu_token_aqui"

# Testar criar pacote
curl -X POST http://44.219.93.219:4567/travel-packages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Teste",
    "destination": "Paris",
    "origin": "Rio de Janeiro",
    "departureDate": "2025-12-30",
    "returnDate": "2026-01-30",
    "description": "Teste",
    "numberOfTravelers": 1
  }'
```

### Opção 3: Adicionar mais logs no backend

Edite `TravelPackage.service.js`:

```javascript
export const createBasePackage = async (req, res) => {
    try {
        console.log('📦 Dados recebidos:', req.body);
        console.log('👤 User ID:', req.user?.id);
        
        const { 
            title, 
            destination, 
            origin, 
            departureDate, 
            returnDate, 
            description, 
            numberOfTravelers 
        } = req.body;
        
        const agentId = req.user.id;
        console.log('🔑 Agent ID:', agentId);
        
        // ... resto do código
        
        console.log('✅ Pacote criado:', travelPackage.id);
        
        res.status(201).json({
            success: true,
            data: travelPackage
        });
    } catch (error) {
        console.error('❌ ERRO COMPLETO:', error);
        console.error('❌ Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: "Erro ao criar pacote de viagem",
            error: error.message
        });
    }
};
```

---

## ✅ Código Atual (Correto):

```javascript
const travelPackage = await TravelPackage.create({
    agentId,
    title: title || `${origin} para ${destination}`,
    destination,
    origin,
    departureDate,
    returnDate,
    description: description || '',
    numberOfTravelers: numberOfTravelers || 1,
    availableSlots: numberOfTravelers || 1,  // ✅ PRESENTE
    totalMoneyPrice: 0,                       // ✅ PRESENTE
    totalMilesPrice: 0,                       // ✅ PRESENTE
    status: 'AVAILABLE'                       // ✅ PRESENTE
});
```

---

## 🎯 Próximos Passos:

1. **Ver os logs do servidor** para identificar o erro exato
2. **Verificar se o banco está sincronizado**
3. **Testar com curl** para isolar o problema
4. **Adicionar mais logs** se necessário

---

## 📝 Checklist de Verificação:

- [ ] Servidor está rodando? (`pm2 list`)
- [ ] Token é válido? (não expirou)
- [ ] Usuário é agente? (role = 'agent')
- [ ] Banco de dados sincronizado?
- [ ] Campos obrigatórios preenchidos?
- [ ] Datas no formato correto? (AAAA-MM-DD)

---

## 💡 Dica Rápida:

Execute no servidor:

```bash
pm2 logs vendasviagens --lines 50
```

E tente criar o pacote novamente no app. O erro exato vai aparecer nos logs!
