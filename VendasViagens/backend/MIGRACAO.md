# 🔄 Guia de Migração do Banco de Dados

## ❌ Erro Atual:

```
SQLITE_ERROR: no such column: totalMilesPrice
```

**Causa:** O banco de dados tem a coluna antiga `totalPriceMiles` mas o código foi atualizado para usar `totalMilesPrice`.

---

## ✅ Soluções:

### **Opção 1: Migração Segura (Mantém Dados)** ⭐ Recomendado

```bash
node backend/migrate-database-safe.js
```

**O que faz:**
- ✅ Atualiza a estrutura das tabelas
- ✅ Mantém os dados existentes
- ✅ Adiciona novas colunas
- ✅ Remove colunas antigas

**Quando usar:**
- Você tem dados importantes no banco
- Está em desenvolvimento mas quer manter os dados de teste

---

### **Opção 2: Recriar Banco (Apaga Dados)** ⚠️ Cuidado

```bash
node backend/migrate-database.js
```

**O que faz:**
- ⚠️ APAGA todos os dados
- ✅ Recria todas as tabelas do zero
- ✅ Garante estrutura 100% correta

**Quando usar:**
- Você não tem dados importantes
- Está começando o desenvolvimento
- Quer começar do zero

---

### **Opção 3: Manual (SQLite)** 🔧 Avançado

Se você quiser fazer manualmente:

```sql
-- 1. Renomear coluna em travel_packages
ALTER TABLE travel_packages RENAME COLUMN totalPriceMiles TO totalMilesPrice;

-- 2. Renomear coluna em purchases
ALTER TABLE purchases RENAME COLUMN totalPriceMiles TO totalMilesPrice;

-- 3. Adicionar colunas faltantes em package_components (se necessário)
ALTER TABLE package_components ADD COLUMN title TEXT;
ALTER TABLE package_components ADD COLUMN componentName TEXT;
ALTER TABLE package_components ADD COLUMN AmadeusId TEXT;
ALTER TABLE package_components ADD COLUMN checkinDate DATETIME;
ALTER TABLE package_components ADD COLUMN checkoutDate DATETIME;

-- 4. Remover coluna agentId de package_components (se existir)
-- SQLite não suporta DROP COLUMN diretamente, precisa recriar a tabela
```

**Nota:** SQLite tem limitações com ALTER TABLE. A Opção 1 ou 2 é mais confiável.

---

## 📋 Campos Atualizados:

### **TravelPackage:**
```javascript
// Antes:
totalPriceMiles: DECIMAL(10, 2)

// Depois:
totalMilesPrice: DECIMAL(10, 2)
```

### **Purchase:**
```javascript
// Antes:
totalPriceMiles: DECIMAL(10, 2)

// Depois:
totalMilesPrice: DECIMAL(10, 2)
```

### **PackageComponents:**
```javascript
// Adicionados:
title: STRING
componentName: STRING
AmadeusId: STRING
checkinDate: DATE
checkoutDate: DATE

// Removido:
agentId: INTEGER (não deveria estar aqui)
```

---

## 🧪 Após a Migração:

### **1. Verificar se funcionou:**

```bash
# Iniciar o servidor
node backend/server.js

# Testar uma rota
GET http://localhost:4567/travel-packages/2/options?type=HOTEL
```

### **2. Criar um novo pacote de teste:**

```bash
POST http://localhost:4567/travel-packages
Authorization: Bearer {seu_token}

{
  "title": "Pacote Teste",
  "origin": "GRU",
  "destination": "GIG",
  "departureDate": "2025-12-15",
  "returnDate": "2025-12-20",
  "description": "Teste após migração",
  "availableSlots": 10,
  "numberOfTravelers": 2
}
```

---

## ⚠️ Importante:

1. **Faça backup** antes de executar qualquer migração
2. **Feche o servidor** antes de migrar
3. **Teste** após a migração
4. Se algo der errado, você pode deletar o arquivo `db/travel_packages.db` e executar a Opção 2

---

## 💡 Dica:

Para evitar problemas futuros, sempre que mudar o modelo:

```bash
# Em desenvolvimento (apaga dados)
node backend/migrate-database.js

# Em produção (mantém dados)
node backend/migrate-database-safe.js
```

Ou configure o Sequelize para fazer isso automaticamente no `server.js`:

```javascript
// Desenvolvimento
await db.sequelize.sync({ force: true });  // Apaga tudo

// Produção
await db.sequelize.sync({ alter: true });  // Atualiza sem apagar
```
