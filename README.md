## 🔗 Links (Deliverables)

- 🚀 **Aplicação no Ar (Vercel):** [https://finchat-ai-case.vercel.app/](https://finchat-ai-case.vercel.app/)
- 💻 **Repositório (Código Fonte):** [https://github.com/caiooliveira132/finchat-ai-case](https://github.com/caiooliveira132/finchat-ai-case)

# 🤖 FinChat AI - Leitura Inteligente de Documentos

Uma aplicação Fullstack que utiliza **OCR (Tesseract.js)** para ler documentos e **Google Gemini 2.5 Flash** para permitir que o usuário converse com o conteúdo do documento via chat.

---

## 🚀 Tecnologias Utilizadas

- **Frontend:** Next.js 14, Tailwind CSS, Lucide Icons, Axios.
- **Backend:** NestJS, Multer (Uploads), Tesseract.js (OCR), Google Generative AI SDK.

---

## 💻 Como rodar o projeto localmente

Siga os passos abaixo para executar a aplicação na sua máquina.

### Pré-requisitos
- Node.js (v18 ou superior) instalado.
- Uma chave de API do Google Gemini (AI Studio).

### 1. Configurando o Backend (Servidor)

1. Entre na pasta do servidor:
   cd server

2. Instale as dependências:
    npm install

3. Crie um arquivo .env na raiz da pasta server e adicione sua chave:
    GEMINI_API_KEY="SUA_CHAVE_AQUI"

4. Inicie o servidor:
    npm run start:dev

    O backend rodará em: http://localhost:3000

### 2. Configurando o Frontend (Web)

1. Em um novo terminal, entre na pasta web:
    cd web

2. Instale as dependências:
    npm install

3. Inicie a aplicação:
    npm run dev

4. Acesse no navegador:
    http://localhost:3000

## 🧪 Como testar

1. Na tela de login, digite qualquer e-mail (ex: teste@empresa.com).

2. Faça o upload de uma imagem (JPG/PNG) contendo texto (ex: Nota Fiscal, Recibo).

3. Aguarde o processamento do OCR.

4. Selecione o documento e faça perguntas como:

- "Qual o valor total?"
- "Quem é o fornecedor?"
- "Qual a data do documento?"

### Desenvolvido por Caio Oliveira