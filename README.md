# Vivi Martins - Landing Page

Landing page de conversão com sistema anti-bot cloaker para Facebook Ads.

## 🚀 Deploy no Netlify

### Opção 1: Deploy Automático (Recomendado)

1. Acesse https://app.netlify.com
2. Clique em **"Add new site"** → **"Import an existing project"**
3. Selecione **GitHub**
4. Autorize e escolha este repositório
5. Configuração automática:
   - Build command: `echo 'Static site - no build needed'`
   - Publish directory: `.`
6. Clique em **"Deploy site"**

O site será deployado automaticamente a cada push para o repositório.

### Opção 2: Deploy Manual via CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=.
```

## 📁 Estrutura do Projeto

```
projeto/
├── index.html           # Landing page principal
├── safe-page.html       # Página segura para bots do Facebook
├── script.js            # Lógica da aplicação (admin, config)
├── cloaker.js           # Sistema anti-bot
├── style.css            # Estilos da página
├── public/
│   └── assets/
│       ├── iphone.jpeg          # Mockup padrão do iPhone
│       ├── bg-car-BSyEnrCi.jpg  # Background da página
│       ├── ios-fire.png         # Ícone 🔥
│       ├── ios-lock.png         # Ícone 🔒
│       ├── og-image.png         # Imagem OG para redes sociais
│       └── r1-desktop.png
├── netlify.toml         # Configuração do Netlify
└── .netlifyignore       # Arquivos ignorados no deploy
```

## 🔧 Funcionalidades

- **Cloaker Anti-Bot**: Detecta crawlers do Facebook e mostra página segura
- **Painel Admin**: Gerencia link do WhatsApp e imagem do iPhone
- **localStorage**: Salva configurações localmente
- **Responsivo**: Mobile-first design
- **Facebook Pixel**: Rastreamento de conversões
- **SPA Fallback**: Redirecionamento automático para `index.html`

## ⚙️ Configurações Netlify

### Redirects
- `/safe-page` → `/safe-page.html`
- `/*` → `/index.html` (SPA fallback)

### Cache
- **HTML**: Sem cache (`max-age=0`)
- **JS/CSS**: 1 ano de cache (`max-age=31536000`)
- **Assets**: 1 ano de cache (`max-age=31536000`)

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`

## 📝 Notas

- O projeto é 100% estático (HTML, CSS, JS puro)
- Nenhuma compilação necessária
- Dados salvos em `localStorage` (cliente)
- Acesso ao painel admin: `#admin` na URL

## 🎯 URLs

- **Produção**: https://seu-dominio-netlify.netlify.app
- **Admin**: https://seu-dominio-netlify.netlify.app#admin
- **Página Segura**: https://seu-dominio-netlify.netlify.app/safe-page.html
