# 🏙️ CivicConnect

**Empowering citizens to build better communities**

CivicConnect is a modern civic engagement platform that enables citizens to report municipal issues, track their resolution progress, and work together with local authorities to improve their communities.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Authentication](#-authentication)
- [Usage](#-usage)
- [API Routes](#-api-routes)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### For Citizens
- **📍 Geolocation Tagging**: Automatically tag the exact location of issues using GPS or by selecting on an interactive map
- **📸 Image Upload**: Attach photos to issue reports for better context and documentation
- **🗺️ Interactive Map View**: Visualize all reported issues on a live map with filtering by category and status
- **📊 Real-time Tracking**: Monitor the progress of reported issues from submission to resolution
- **🏷️ Category-based Reporting**: Organize issues by categories (Infrastructure, Sanitation, Safety, etc.)
- **👤 User Dashboard**: View and manage all your submitted issues in one place

### For Administrators
- **🔐 Role-based Access Control**: Separate roles for Citizens, Staff, and Administrators
- **📋 Issue Management**: Review, acknowledge, and update the status of reported issues
- **📈 Admin Dashboard**: Overview of all issues with filtering and sorting capabilities
- **✅ Status Updates**: Update issue status through multiple stages (Submitted → Acknowledged → In Progress → Resolved → Closed)

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide Icons](https://lucide.dev/)** - Modern icon library

### Backend & Database
- **[Prisma](https://www.prisma.io/)** - Modern ORM for database management
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication framework

### Maps & Geolocation
- **[Leaflet](https://leafletjs.com/)** - Interactive mapping library
- **[React Leaflet](https://react-leaflet.js.org/)** - React components for Leaflet

### Media Management
- **[Cloudinary](https://cloudinary.com/)** - Cloud-based image and video management

### Form Handling
- **[React Hook Form](https://react-hook-form.com/)** - Performance-optimized form library
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (recommended) or npm/yarn
- **PostgreSQL** database
- **Cloudinary** account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/capstone-project-group-51.git
   cd capstone-project-group-51
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/civicconnect"
   
   # NextAuth
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   pnpm prisma generate
   
   # Run migrations
   pnpm prisma migrate dev
   
   # Seed the database (optional)
   pnpm prisma db seed
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
capstone-project-group-51/
├── app/                      # Next.js App Router directory
│   ├── api/                  # API routes
│   │   ├── auth/             # NextAuth authentication
│   │   ├── issues/           # Issue management endpoints
│   │   └── categories/       # Category management
│   ├── dashboard/            # User dashboard
│   ├── admin/                # Admin panel
│   ├── issues/               # Issue browse/view pages
│   ├── report/               # Issue reporting page
│   ├── map/                  # Interactive map view
│   ├── login/                # Login page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page
│   └── globals.css           # Global styles
├── components/               # React components
│   └── ui/                   # Reusable UI components
├── lib/                      # Utility functions
├── prisma/                   # Database schema and migrations
│   ├── schema.prisma         # Prisma schema
│   └── seed.js               # Database seeding script
├── public/                   # Static assets
├── types/                    # TypeScript type definitions
├── .env                      # Environment variables (not in git)
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Secret key for NextAuth session encryption | Yes |
| `NEXTAUTH_URL` | Base URL of your application | Yes |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |

---

## 🗄️ Database Setup

### Schema Overview

The database consists of the following main models:

- **User**: Citizens, staff, and administrators with role-based access
- **Issue**: Reported civic issues with geolocation, images, and status tracking
- **Category**: Issue categories for organization
- **Account/Session/VerificationToken**: NextAuth authentication models

### User Roles

- `CITIZEN` - Can report and track their own issues
- `STAFF` - Can view and update issue status
- `ADMIN` - Full access to all features and user management

### Issue Status Flow

```
SUBMITTED → ACKNOWLEDGED → IN_PROGRESS → RESOLVED → CLOSED
```

### Running Migrations

```bash
# Create a new migration
pnpm prisma migrate dev --name migration_name

# Apply migrations in production
pnpm prisma migrate deploy

# Reset database (⚠️ destroys all data)
pnpm prisma migrate reset
```

### Database Seeding

```bash
pnpm prisma db seed
```

This will populate the database with:
- Sample categories (Infrastructure, Sanitation, Safety, etc.)
- Test users with different roles
- Example issues for demonstration

---

## 🔑 Authentication

CivicConnect uses **NextAuth.js** for authentication with support for multiple providers.

### Current Providers
- Email/Password (credentials provider)
- Google OAuth (can be configured)
- GitHub OAuth (can be configured)

### Protected Routes

The following routes require authentication:
- `/dashboard` - User dashboard
- `/report` - Issue reporting
- `/admin` - Admin panel (requires ADMIN role)

---

## 💡 Usage

### Reporting an Issue

1. **Sign in** or create an account
2. Click **"Report an Issue"** from the landing page or dashboard
3. **Fill in the details**:
   - Title and description
   - Select a category
   - Add location (auto-detected or manually selected on map)
   - Upload a photo (optional)
4. **Submit** the report
5. Track the issue status from your dashboard

### Viewing Issues on Map

1. Navigate to the **Map** page
2. View all reported issues as markers
3. **Filter** by category or status
4. Click on markers to see issue details

### Admin Functions

1. Access the **Admin Dashboard**
2. View all reported issues
3. **Update status** of issues:
   - Acknowledge new submissions
   - Mark as "In Progress" when work begins
   - Update to "Resolved" when fixed
   - Close completed issues
4. View user statistics and reports

---

## 🔌 API Routes

### Public Routes

- `GET /api/issues` - Get all issues (with optional filters)
- `GET /api/categories` - Get all categories

### Protected Routes (Authentication Required)

- `POST /api/issues` - Create a new issue
- `GET /api/issues/:id` - Get a specific issue
- `PATCH /api/issues/:id` - Update an issue (Admin/Staff only)
- `DELETE /api/issues/:id` - Delete an issue (Admin only)

### Example API Request

```javascript
// Create a new issue
const response = await fetch('/api/issues', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Broken streetlight',
    description: 'Streetlight not working on Main St',
    categoryId: 'category-id',
    latitude: 40.7128,
    longitude: -74.0060,
    imageUrl: 'https://cloudinary.com/...',
  }),
})
```

---

## 🏗️ Building for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

---

## 🧪 Development Commands

```bash
# Run development server
pnpm dev

# Run ESLint
pnpm lint

# Format code
pnpm format

# Generate Prisma Client
pnpm prisma generate

# Open Prisma Studio (database GUI)
pnpm prisma studio
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is part of a capstone project for academic purposes.

---

## 👥 Team

**Group 51** - Capstone Project

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Radix UI for accessible components
- Prisma for the excellent ORM
- OpenStreetMap & Leaflet for mapping capabilities
- All contributors and testers

---

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team

---

**Built with ❤️ for better communities**
