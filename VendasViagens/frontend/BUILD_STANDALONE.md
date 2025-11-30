# Como Fazer Build Standalone do App

Este guia explica como gerar um APK/IPA do seu app para que o Google OAuth funcione corretamente.

## Por que preciso disso?

O **Expo Go** não consegue registrar deep links customizados (`minhaapp://`), o que impede o OAuth de funcionar. Com um build standalone, você terá seu próprio app instalado no celular e o OAuth funcionará perfeitamente.

## Pré-requisitos

- Conta no Expo (gratuita)
- Node.js instalado
- Projeto funcionando no Expo Go

## Passo 1: Instalar EAS CLI

```bash
npm install -g eas-cli
```

## Passo 2: Fazer Login no Expo

```bash
eas login
```

Se não tiver conta, crie em: https://expo.dev/signup

## Passo 3: Configurar o Projeto

```bash
cd frontend
eas build:configure
```

Isso vai criar o arquivo `eas.json` com as configurações de build.

## Passo 4: Atualizar app.json

Certifique-se que seu `app.json` tem estas configurações:

```json
{
  "expo": {
    "name": "Vendas Viagens",
    "slug": "vendas-viagens",
    "version": "1.0.0",
    "scheme": "minhaapp",
    "android": {
      "package": "com.seudominio.vendasviagens",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "ios": {
      "bundleIdentifier": "com.seudominio.vendasviagens",
      "supportsTablet": true
    }
  }
}
```

## Passo 5: Gerar o Build

### Para Android (APK - mais rápido para testar):

```bash
eas build --platform android --profile preview
```

### Para iOS (requer conta Apple Developer - $99/ano):

```bash
eas build --platform ios --profile preview
```

## Passo 6: Aguardar o Build

- O build é feito na nuvem do Expo
- Leva cerca de 10-15 minutos
- Você pode acompanhar o progresso no terminal ou em: https://expo.dev/accounts/[seu-usuario]/projects/[seu-projeto]/builds

## Passo 7: Baixar e Instalar

### Android:
1. Quando o build terminar, você receberá um link para baixar o APK
2. Baixe o APK no seu celular Android
3. Habilite "Instalar apps de fontes desconhecidas" nas configurações
4. Instale o APK

### iOS:
1. Você precisa de um certificado de desenvolvedor Apple
2. O build gera um arquivo IPA
3. Use TestFlight ou instale via Xcode

## Passo 8: Testar o OAuth

Agora que o app está instalado como standalone:

1. Abra o app (não é mais pelo Expo Go)
2. Clique em "Login com Google"
3. Faça login no Google
4. O app vai abrir automaticamente após o login ✅
5. Você estará logado!

## Comandos Úteis

### Ver builds anteriores:
```bash
eas build:list
```

### Cancelar um build em andamento:
```bash
eas build:cancel
```

### Gerar build de produção (para publicar na Play Store):
```bash
eas build --platform android --profile production
```

## Troubleshooting

### "Build failed"
- Verifique se o `app.json` está correto
- Certifique-se que não há erros no código
- Veja os logs completos em: https://expo.dev

### "Deep link não funciona"
- Verifique se o `scheme` no `app.json` é `minhaapp`
- Certifique-se que o Google Cloud Console tem a URL correta
- Reinstale o app

### "Demora muito"
- Builds gratuitos podem demorar mais em horários de pico
- Considere o plano pago do EAS para builds mais rápidos

## Alternativas

Se não quiser fazer build standalone agora:

1. **Use login com email/senha** - funciona no Expo Go
2. **Teste apenas no build** - desenvolva outras features no Expo Go e teste OAuth só no build final

## Recursos

- [Documentação EAS Build](https://docs.expo.dev/build/introduction/)
- [Configuração de Deep Links](https://docs.expo.dev/guides/deep-linking/)
- [Google OAuth com Expo](https://docs.expo.dev/guides/authentication/#google)

---

**Dica:** Depois de fazer o primeiro build, você pode continuar desenvolvendo no Expo Go e só gerar novos builds quando precisar testar funcionalidades nativas como OAuth.
