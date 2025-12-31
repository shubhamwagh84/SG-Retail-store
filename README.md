# Utensils Shop Portal

A beautiful, mobile-first web portal for managing your utensils shop inventory and daily sales.

## Features

- 📦 Product inventory management (add, update, remove)
- 💰 Quick sales logging with automatic stock updates
- 📊 Real-time metrics (stock levels, low stock alerts, daily sales)
- 🔐 Shared passcode authentication
- 📱 Progressive Web App (PWA) - install on mobile/desktop
- 🌐 Google Sheets integration (optional live sync)
- 📸 Firebase Storage integration (optional image uploads)
- 🎨 Beautiful gradient UI with Tailwind CSS

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set:

- `PORTAL_PASSCODE` - Your secure passcode (default: `demo123`)

**Optional integrations:**

- Google Sheets API credentials (for live data sync)
- Firebase Storage config (for product image uploads)

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with your passcode.

### 4. Build for Production

```bash
npm run build
npm start
```

## Google Sheets Setup (Optional)

1. Create a Google Cloud project
2. Enable Google Sheets API
3. Create a service account and download JSON key
4. Share your spreadsheet with the service account email
5. Add these to `.env.local`:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_SHEETS_SPREADSHEET_ID`

**Sheet structure:**

**Products sheet** (columns A-G):
| id | name | category | price | stock | photoUrl | updatedAt |

**Sales sheet** (columns A-G):
| id | productId | qty | amount | soldAt | note | user |

## Firebase Storage Setup (Optional)

1. Create a Firebase project
2. Enable Storage
3. Get your web config
4. Add these to `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

## Mobile PWA Installation

On mobile browsers (Chrome/Safari), tap "Add to Home Screen" for native app-like experience.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **Backend:** Google Sheets API
- **Storage:** Firebase Storage
- **Language:** TypeScript

## License

MIT
