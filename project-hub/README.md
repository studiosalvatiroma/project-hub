# ProjectHub - Alternativa Gratuita a Monday.com

Una web app moderna per gestire progetti e task con Kanban board, Timeline/Gantt, collaborazione team e statistiche.

## 🚀 Features

- **Kanban Board**: Gestione visiva dei task con drag-and-drop
- **Timeline/Gantt**: Visualizzazione temporale dei progetti
- **Team Collaboration**: Commenti, @mention, assegnazioni
- **Automazioni**: Workflow semplici basati su trigger
- **Reporting**: Dashboard con statistiche e grafici
- **Priorità e Labels**: Organizzazione colorata dei task
- **Allegati**: Upload di file nei task
- **Autenticazione**: Sistema login/register sicuro

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS, @dnd-kit
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Charts**: Recharts
- **Hosting**: Vercel

## 📦 Setup Locale

### Prerequisiti
- Node.js 18+
- MongoDB Atlas account (gratuito)
- npm o yarn

### Installazione

1. **Installa dipendenze**
```bash
npm install
```

2. **Configura le variabili di ambiente**
Crea un file `.env.local` nella root (vedi `.env.local` di esempio):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/project-hub
NEXTAUTH_SECRET=your-secret-key-change-in-production
JWT_SECRET=your-jwt-secret-change-in-production
NEXT_PUBLIC_API_URL=http://localhost:3000
```

3. **Avvia il server di sviluppo**
```bash
npm run dev
```

L'app sarà disponibile a `http://localhost:3000`

## 🌐 Deploy su Vercel

### Opzione 1: Vercel CLI

```bash
npm i -g vercel
vercel
```

### Opzione 2: GitHub Integration
1. Push il repo su GitHub
2. Vai a [vercel.com](https://vercel.com)
3. Import il progetto da GitHub
4. Configura le environment variables
5. Deploy automatico al push

### Variabili di ambiente per Vercel
- `MONGODB_URI`: Connessione MongoDB
- `NEXTAUTH_SECRET`: Secret key per autenticazione
- `JWT_SECRET`: Secret per JWT
- `NEXT_PUBLIC_API_URL`: URL pubblico dell'app

## 📚 Struttura del Progetto

```
project-hub/
├── app/
│   ├── api/              # API Routes
│   ├── auth/             # Pagine autenticazione
│   ├── dashboard/        # Dashboard e progetti
│   └── page.tsx          # Home page
├── components/           # React components
├── lib/
│   ├── mongodb.ts        # Connessione DB
│   └── models/           # Schemi MongoDB
└── public/               # File statici
```

## 💰 Costi

- **Vercel**: Gratuito (limite gratis) o $20/mese
- **MongoDB Atlas**: Gratuito (512MB) o $0.57/GB
- **Costo totale**: €0-10/mese

## 📝 License

MIT
