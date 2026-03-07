# HealthDecode - Tech Stack

## 🎨 Frontend

### Core Framework
- **Next.js 16.1.6** - React framework with App Router
- **React 19.2.4** - UI library
- **TypeScript 5.7.3** - Type-safe JavaScript

### UI & Styling
- **Tailwind CSS 4.2.0** - Utility-first CSS framework
- **Radix UI** - Headless UI components
  - Dialog, Dropdown, Tabs, Toast, Tooltip, etc.
- **Framer Motion 11.15.0** - Animation library
- **Lucide React 0.564.0** - Icon library

### 3D Graphics
- **Three.js 0.183.2** - 3D graphics library
- **@react-three/fiber 9.5.0** - React renderer for Three.js
- **@react-three/drei 10.7.7** - Useful helpers for react-three-fiber

### Data Visualization
- **Recharts 2.15.0** - Chart library for React
- **React Day Picker 9.13.2** - Date picker component

### Forms & Validation
- **React Hook Form 7.54.1** - Form state management
- **Zod 3.24.1** - Schema validation
- **@hookform/resolvers 3.9.1** - Form validation resolvers

### State Management
- **React Context API** - Global state (Auth, Theme)
- **LocalStorage** - Client-side data persistence

---

## ⚙️ Backend

### Runtime & Framework
- **Node.js** - JavaScript runtime
- **Next.js API Routes** - Serverless API endpoints
- **Vercel Serverless Functions** - Deployment platform

### AI & NLP
- **Groq SDK 0.7.0** - AI inference (Llama 3.3 70B)
- **OpenAI API** - Alternative AI provider
- **Compromise 14.15.0** - Natural language processing
- **Natural 8.1.1** - NLP library for medical entity extraction

### OCR & Document Processing
- **pdf-parse 1.1.1** - PDF text extraction
- **Tesseract.js 5.0.5** - OCR for images
- **Google Cloud Vision API 4.3.3** - Advanced OCR (optional)

### Authentication & Security
- **bcryptjs 3.0.3** - Password hashing
- **jsonwebtoken 9.0.3** - JWT token generation
- **js-cookie 3.0.5** - Cookie management

### Email & Notifications
- **Nodemailer 8.0.1** - Email sending
- **Resend API** - Email service provider

### File Processing
- **jsPDF 4.2.0** - PDF generation
- **jspdf-autotable 5.0.7** - PDF table generation

---

## 🗄️ Database

### Primary Database
- **PostgreSQL** - Production database
- **Neon** - Serverless Postgres hosting
- **Prisma 5.22.0** - ORM (Object-Relational Mapping)
- **@prisma/client 5.22.0** - Prisma client

### Database Schema
```prisma
- User (id, email, password, name, healthScore)
- Report (id, userId, fileName, fileUrl, extractedData, aiSummary)
- HealthMetric (id, userId, type, value, date)
- ChatMessage (id, userId, role, content)
```

### Local Development
- **SQLite** - Local development database
- **LocalStorage** - Browser-based storage fallback

---

## 🚀 Deployment & DevOps

### Hosting
- **Vercel** - Frontend & API hosting
- **Neon** - PostgreSQL database hosting

### CI/CD
- **GitHub** - Version control
- **Vercel Git Integration** - Automatic deployments

### Environment Variables
```env
DATABASE_URL - PostgreSQL connection string
GROQ_API_KEY - AI API key
JWT_SECRET - Authentication secret
RESEND_API_KEY - Email service key
```

---

## 📦 Additional Libraries

### Utilities
- **clsx 2.1.1** - Conditional className utility
- **tailwind-merge 3.3.1** - Merge Tailwind classes
- **date-fns 4.1.0** - Date manipulation
- **class-variance-authority 0.7.1** - Component variants

### UI Components
- **cmdk 1.1.1** - Command menu
- **sonner 1.7.1** - Toast notifications
- **vaul 1.1.2** - Drawer component
- **embla-carousel-react 8.6.0** - Carousel component
- **input-otp 1.4.2** - OTP input component

### Analytics
- **@vercel/analytics 1.6.1** - Web analytics

---

## 🏗️ Architecture

### Design Pattern
- **Server-Side Rendering (SSR)** - Next.js App Router
- **API Routes** - RESTful endpoints
- **Client-Side Rendering** - Interactive components
- **Serverless Functions** - Scalable backend

### File Structure
```
medical-win/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── auth/              # Authentication pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── dashboard/        # Dashboard-specific components
│   └── landing/          # Landing page components
├── lib/                   # Utility functions
│   ├── auth-context.tsx  # Authentication context
│   ├── medical-nlp.ts    # Medical NLP processing
│   └── prisma.ts         # Database client
├── prisma/               # Database schema & migrations
└── public/               # Static assets
```

---

## 🔒 Security Features

- **Password Hashing** - bcryptjs
- **JWT Authentication** - Secure token-based auth
- **HTTPS** - Encrypted connections
- **Environment Variables** - Secure credential storage
- **Input Validation** - Zod schema validation
- **SQL Injection Prevention** - Prisma ORM
- **XSS Protection** - React's built-in escaping

---

## 📊 Performance Optimizations

- **Server Components** - Reduced client-side JavaScript
- **Image Optimization** - Next.js Image component
- **Code Splitting** - Automatic route-based splitting
- **Caching** - Vercel Edge Network
- **Lazy Loading** - Dynamic imports
- **Turbopack** - Fast bundler for development

---

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📱 Responsive Design

- **Mobile-first approach**
- **Tailwind breakpoints**: sm, md, lg, xl, 2xl
- **Touch-friendly UI**
- **Adaptive layouts**

---

## 🔄 API Endpoints

```
POST /api/auth/signup      - User registration
POST /api/auth/signin      - User login
POST /api/auth/logout      - User logout
POST /api/upload           - File upload
POST /api/upload/process   - OCR & AI analysis
GET  /api/reports          - Get user reports
POST /api/reports          - Create report
GET  /api/health-metrics   - Get health metrics
POST /api/health-metrics   - Add health metric
POST /api/chat             - AI chatbot
```

---

## 📈 Scalability

- **Serverless Architecture** - Auto-scaling
- **Edge Functions** - Global distribution
- **Database Connection Pooling** - Efficient DB usage
- **CDN** - Static asset delivery
- **Lazy Loading** - On-demand resource loading

---

**Total Dependencies**: 80+ packages
**Bundle Size**: Optimized with tree-shaking
**Performance Score**: 90+ on Lighthouse
