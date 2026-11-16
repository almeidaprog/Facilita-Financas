# Facilita Finanças — React Native / Android

Versão do projeto preparada para a disciplina **Programação em Dispositivos Android**.

## Arquitetura

- **Mobile:** React Native + Expo + Expo Router
- **Back-end:** Python + FastAPI
- **ORM:** SQLAlchemy
- **Banco:** PostgreSQL
- **Migrações:** Alembic

O antigo front-end React/Vite não é necessário nesta entrega. O back-end e o banco continuam os mesmos; a interface foi migrada para React Native.

## 1. Preparar o back-end

No PowerShell:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Crie `backend/.env` a partir do `.env.example` e informe sua conexão PostgreSQL.

Depois:

```powershell
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0
```

> `--host 0.0.0.0` é importante para um celular na mesma rede conseguir acessar o FastAPI.

Swagger no PC:

`http://127.0.0.1:8000/docs`

## 2. Preparar o aplicativo React Native

Abra outro terminal:

```powershell
cd mobile
npm install
npx expo start
```

Para testar no celular, instale **Expo Go** no Android e leia o QR Code exibido pelo Expo.

O projeto usa Expo SDK 57 porque, durante a transição atual do SDK 58, a documentação oficial recomenda SDK 57 para testes com Expo Go em dispositivo físico.

### Conexão com a API

No desenvolvimento com Expo Go, o app tenta descobrir automaticamente o IP do computador pelo host do Expo.

Se isso não funcionar, copie `.env.example` para `.env` e configure manualmente:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:8000
```

Exemplo:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.15:8000
```

PC e celular precisam estar na mesma rede. Se o Windows perguntar sobre Firewall, permita acesso em **Redes privadas**.

## 3. Funcionalidades prontas

- cadastro de usuário;
- login com senha protegida por bcrypt;
- sessão simples persistida no dispositivo;
- primeiro acesso com definição de renda mensal;
- categorias padrão automáticas;
- criação, edição e exclusão de categorias;
- criação de categoria dentro do próprio lançamento;
- receitas e despesas;
- criação, edição e exclusão de lançamentos;
- dashboard com renda, receitas extras, despesas e saldo estimado;
- resumo de despesas por categoria;
- histórico dos últimos lançamentos;
- interface pensada para toque e telas Android;
- navegação inferior nativa por abas.

## 4. Gerar APK para instalar no Android

O projeto já inclui `eas.json` com um perfil `preview` para APK.

```powershell
cd mobile
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview
```

O perfil `preview` gera **APK**, que pode ser instalado diretamente em um aparelho Android.

Para Google Play, o perfil `production` gera **AAB**:

```powershell
npx eas-cli@latest build -p android --profile production
```

## 5. Antes da apresentação

1. Inicie PostgreSQL.
2. Rode o FastAPI com `--host 0.0.0.0`.
3. Rode `npx expo start` em `mobile`.
4. Abra no Android pelo Expo Go.
5. Teste cadastro/login.
6. Informe uma renda mensal.
7. Cadastre uma despesa e uma receita.
8. Mostre o Dashboard e o histórico.
9. Mostre rapidamente o Swagger e o PostgreSQL para evidenciar a integração.

## Documentação já entregue ao professor

A documentação anterior não invalida o projeto. Ela retrata uma etapa em que a interface estava em React Web/Vite. A implementação evoluiu posteriormente para **React Native + Expo** para adequar o produto ao requisito da disciplina de dispositivos Android.

Se perguntarem, a explicação correta e simples é:

> “Após a entrega da documentação, migramos a camada de apresentação de React Web para React Native com Expo para adequar a implementação ao requisito Android. A API FastAPI, o PostgreSQL, as entidades e as regras de negócio foram preservados.”

Isso é uma evolução de implementação, não uma mudança no objetivo do sistema.
