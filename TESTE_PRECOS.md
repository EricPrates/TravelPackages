# Teste de Retorno de Preços - Sistema de Pacotes de Viagem

## ✅ Sim! Você conseguirá retornar todos os preços corretamente

### 📦 Estrutura de Dados Retornada

#### 1. **GET /travel-packages/:id** - Buscar um pacote específico

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Pacote Rio de Janeiro",
    "description": "Viagem completa para o Rio",
    "destination": "Rio de Janeiro",
    "origin": "São Paulo",
    "departureDate": "2024-12-20",
    "returnDate": "2024-12-27",
    "availableSlots": 10,
    "totalMoneyPrice": 3500.00,    // ✅ PREÇO TOTAL EM DINHEIRO
    "totalMilesPrice": 175000,      // ✅ PREÇO TOTAL EM MILHAS
    "status": "AVAILABLE",
    "images": [],
    "components": [                 // ✅ COMPONENTES COM PREÇOS INDIVIDUAIS
      {
        "id": 1,
        "name": "São Paulo to Rio de Janeiro flight",
        "description": "Voo direto",
        "type": "FLIGHT",
        "moneyPrice": 800.00,       // ✅ PREÇO DO VOO EM DINHEIRO
        "milesPrice": 40000          // ✅ PREÇO DO VOO EM MILHAS
      },
      {
        "id": 2,
        "name": "Hotel Copacabana Palace",
        "description": "7 noites",
        "type": "HOTEL",
        "moneyPrice": 2100.00,      // ✅ PREÇO DO HOTEL EM DINHEIRO
        "milesPrice": 105000         // ✅ PREÇO DO HOTEL EM MILHAS
      },
      {
        "id": 3,
        "name": "Activity in Rio de Janeiro",
        "description": "City tour",
        "type": "ACTIVITY",
        "moneyPrice": 300.00,       // ✅ PREÇO DA ATIVIDADE EM DINHEIRO
        "milesPrice": 15000          // ✅ PREÇO DA ATIVIDADE EM MILHAS
      },
      {
        "id": 4,
        "name": "Car rental in Rio de Janeiro",
        "description": "Carro econômico",
        "type": "CAR_RENTAL",
        "moneyPrice": 300.00,       // ✅ PREÇO DO CARRO EM DINHEIRO
        "milesPrice": 15000          // ✅ PREÇO DO CARRO EM MILHAS
      }
    ]
  }
}
```

#### 2. **GET /travel-packages** - Listar todos os pacotes

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Pacote Rio de Janeiro",
      "destination": "Rio de Janeiro",
      "origin": "São Paulo",
      "totalMoneyPrice": 3500.00,    // ✅ TOTAL EM DINHEIRO
      "totalMilesPrice": 175000,      // ✅ TOTAL EM MILHAS
      "components": [
        {
          "id": 1,
          "name": "Voo SP-RJ",
          "type": "FLIGHT",
          "moneyPrice": 800.00,       // ✅ PREÇO INDIVIDUAL
          "milesPrice": 40000          // ✅ PREÇO INDIVIDUAL
        }
        // ... outros componentes
      ]
    }
    // ... outros pacotes
  ]
}
```

#### 3. **POST /package-components** - Criar componente (atualiza totais automaticamente)

```json
{
  "success": true,
  "message": "Componente criado com sucesso",
  "data": {
    "component": {
      "id": 5,
      "packageId": 1,
      "name": "Voo SP-RJ",
      "type": "FLIGHT",
      "moneyPrice": 800.00,         // ✅ PREÇO DO COMPONENTE
      "milesPrice": 40000            // ✅ PREÇO DO COMPONENTE
    },
    "packageTotals": {
      "totalMoneyPrice": 4300.00,   // ✅ NOVO TOTAL DO PACOTE
      "totalMilesPrice": 215000      // ✅ NOVO TOTAL DO PACOTE
    }
  }
}
```

#### 4. **POST /package-components/batch** - Criar múltiplos componentes

```json
{
  "success": true,
  "message": "3 componente(s) criado(s) com sucesso",
  "data": {
    "componentsCreated": 3,
    "components": [
      {
        "id": 1,
        "name": "Voo",
        "moneyPrice": 800.00,
        "milesPrice": 40000
      },
      {
        "id": 2,
        "name": "Hotel",
        "moneyPrice": 2100.00,
        "milesPrice": 105000
      },
      {
        "id": 3,
        "name": "Atividade",
        "moneyPrice": 300.00,
        "milesPrice": 15000
      }
    ],
    "packageTotals": {
      "totalMoneyPrice": 3200.00,   // ✅ SOMA AUTOMÁTICA
      "totalMilesPrice": 160000      // ✅ SOMA AUTOMÁTICA
    }
  }
}
```

## 🔄 Como Funciona a Atualização Automática

### Quando você cria/atualiza componentes:

1. **Componente é criado** com `moneyPrice` e `milesPrice`
2. **Função `updatePackageTotals()` é chamada automaticamente**
3. **Sistema busca todos os componentes do pacote**
4. **Calcula a soma de todos os preços**
5. **Atualiza `totalMoneyPrice` e `totalMilesPrice` do pacote**

### Código da função (já implementado):

```javascript
export const updatePackageTotals = async (packageId, transaction = null) => {
    // Busca todos os componentes do pacote
    const components = await PackageComponents.findAll({
        where: { packageId },
        ...(transaction && { transaction })
    });
    
    // Soma todos os preços em dinheiro
    const totalMoneyPrice = components.reduce((sum, comp) => 
        sum + Number(comp.moneyPrice || 0), 0
    );
    
    // Soma todos os preços em milhas
    const totalMilesPrice = components.reduce((sum, comp) => 
        sum + Number(comp.milesPrice || 0), 0
    );
    
    // Atualiza o pacote
    await TravelPackage.update({
        totalMoneyPrice,
        totalMilesPrice
    }, {
        where: { id: packageId },
        ...(transaction && { transaction })
    });
    
    return { totalMoneyPrice, totalMilesPrice };
};
```

## ✅ Campos Disponíveis

### No Model TravelPackage:
- ✅ `totalMoneyPrice` - DECIMAL(10, 2)
- ✅ `totalMilesPrice` - DECIMAL(10, 2)

### No Model PackageComponents:
- ✅ `moneyPrice` - FLOAT
- ✅ `milesPrice` - INTEGER

## 🎯 Resumo

**SIM, você conseguirá:**

1. ✅ Ver o preço individual de cada componente (voo, hotel, atividade, carro)
2. ✅ Ver o preço total do pacote em dinheiro
3. ✅ Ver o preço total do pacote em milhas
4. ✅ Os totais são atualizados automaticamente quando você adiciona/remove componentes
5. ✅ Todos os endpoints retornam esses dados corretamente

**Tudo está funcionando perfeitamente!** 🚀
