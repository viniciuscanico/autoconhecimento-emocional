# 📱 Autoconhecimento Emocional — PWA

Aplicativo de rastreamento emocional. Funciona como app instalável no celular via PWA.

---

## 🚀 COMO PUBLICAR (Passo a Passo)

### PASSO 1 — Instalar Node.js (se não tiver)
Baixe em: https://nodejs.org  
Instale a versão LTS (recomendada).

---

### PASSO 2 — Instalar dependências
Abra o terminal nesta pasta e rode:
```bash
npm install
```

---

### PASSO 3 — Testar localmente (opcional)
```bash
npm run dev
```
Abra http://localhost:5173 no navegador.

---

### PASSO 4 — Publicar na Vercel

**Opção A: Pelo site (mais fácil)**

1. Crie conta gratuita em https://vercel.com
2. Clique em "Add New Project"
3. Clique em "Upload" e faça upload desta pasta inteira
4. Clique em "Deploy"
5. Pronto! Você receberá um link como: https://seu-app.vercel.app

**Opção B: Pelo terminal**
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

### PASSO 5 — Instalar no celular como app

**Android (Chrome):**
1. Abra o link do app no Chrome
2. Toque no menu ⋮ (três pontos)
3. Toque em "Adicionar à tela inicial"
4. Confirme — o ícone aparece como um app!

**iPhone (Safari):**
1. Abra o link no Safari (obrigatório, não Chrome)
2. Toque no botão compartilhar ⬆
3. Toque em "Adicionar à Tela de Início"
4. Confirme — o ícone aparece como um app!

---

## 📂 ESTRUTURA DO PROJETO

```
mood-tracker-pwa/
├── public/              ← Ícones e arquivos estáticos
│   ├── favicon.ico
│   ├── icon-192.png     ← Ícone do app (192x192px)
│   ├── icon-512.png     ← Ícone do app (512x512px)
│   └── apple-touch-icon.png
├── src/
│   ├── App.jsx          ← Código principal do app
│   ├── main.jsx         ← Entry point React
│   └── index.css        ← Estilos globais
├── index.html           ← HTML base
├── vite.config.js       ← Config do build + PWA
├── tailwind.config.js   ← Config do Tailwind CSS
├── package.json         ← Dependências
└── vercel.json          ← Config deploy Vercel
```

---

## 🎨 ADICIONAR ÍCONES

Você precisa criar/adicionar 4 arquivos na pasta `public/`:

| Arquivo | Tamanho | Uso |
|---------|---------|-----|
| `favicon.ico` | 32x32px | Aba do navegador |
| `icon-192.png` | 192x192px | Ícone Android |
| `icon-512.png` | 512x512px | Ícone tela de splash |
| `apple-touch-icon.png` | 180x180px | Ícone iPhone |

**Dica:** Use https://favicon.io para gerar todos automaticamente a partir de um emoji ou imagem.

---

## 🔔 SOBRE NOTIFICAÇÕES

O sistema de lembretes está preparado na UI.  
Para notificações push reais funcionarem, é necessário implementar a **Web Push API** com um service worker.

---

## 🛠️ TECNOLOGIAS

- React 18
- Tailwind CSS 3
- Recharts (gráficos)
- Lucide React (ícones)
- Vite (build)
- Vite PWA Plugin (service worker automático)
