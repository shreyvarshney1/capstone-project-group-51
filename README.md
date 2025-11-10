# CivicConnect
CivicConnect is a full-stack, mobile-first web application using Next.js that serves as a bridge between citizens and local government authorities. This platform empowers the public to report civic issues (e.g., potholes, non-functional streetlights, overflowing trash bins), and provide a robust dashboard for municipal staff to manage, track, and resolve these issues efficiently.
## Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** Zustand
- **File Storage:** Cloudinary / AWS S3
- **Mapping:** Leaflet.js
- **Deployment:** Vercel
## Getting Started
### Prerequisites
- Node.js (v18 or higher)
- pnpm
- PostgreSQL database
### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/civicconnect.git
   cd civicconnect
   ```
2. **Install dependencies:**
   ```bash
   pnpm install
   ```
3. **Set up environment variables:**
   Create a `.env` file in the root of the project and add the following variables:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/civicconnect?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```
4. **Push the database schema:**
   ```bash
   pnpm prisma db push
   ```
5. **Run the development server:**
   ```bash
   pnpm dev
   ```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
## Project Structure
```
civic-connect/
├── app/                  # App Router pages
│   ├── (citizen)/        # User routes: /, /report, /my-reports
│   ├── (admin)/          # Auth-guarded: /admin/dashboard, /admin/reports/[id]
│   ├── api/              # API routes: /api/reports, /api/route-report
│   ├── globals.css
│   └── layout.tsx
├── components/           # Reusable: MapView, ReportForm, NotificationBell
├── lib/                  # Utils: prisma.ts, auth.ts, routingEngine.ts
├── public/               # Static assets
├── prisma/               # Schema & migrations
└── package.json          # Dependencies: next, react, prisma, leaflet, recharts, etc.
```
## License
This project is licensed under the MIT License.