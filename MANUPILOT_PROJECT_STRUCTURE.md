# ManuPilot - Complete Project Structure Documentation

**Generated**: 2025-11-28
**Purpose**: Comprehensive documentation of the ManuPilot codebase for AI context transfer

---

## 📋 Project Overview

**ManuPilot** is an AI-powered manufacturing sourcing platform built with Next.js 16 that helps entrepreneurs transform product ideas into factory-ready specifications. It provides end-to-end guidance from concept to supplier connection.

### Tech Stack
- **Framework**: Next.js 16.0.3 (App Router)
- **Language**: TypeScript 5
- **Frontend**: React 19.2.0, Tailwind CSS v4
- **Backend**: Supabase (Auth + PostgreSQL + Realtime)
- **AI**: OpenAI API (GPT-4o-mini)
- **Animations**: Framer Motion 12
- **PDF Generation**: @react-pdf/renderer 4.3.1
- **Markdown**: react-markdown 10.1.0

---

## 🗂️ Root Directory Structure

```
/home/user/manupilot/
├── app/                    # Next.js App Router pages and API routes
├── components/             # React components (organized by feature)
├── lib/                    # Utility libraries and business logic
├── types/                  # TypeScript type definitions
├── public/                 # Static assets
├── supabase/              # Database migrations and config
├── scripts/               # Admin utility scripts
├── middleware.ts          # Auth middleware (admin route protection)
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
├── next.config.ts         # Next.js configuration
├── eslint.config.mjs      # ESLint configuration
├── postcss.config.mjs     # PostCSS configuration
├── .gitignore             # Git ignore rules
├── README.md              # Standard Next.js readme
└── schema_dump.sql        # Database schema (empty placeholder)
```

---

## 📁 Detailed File Structure & Status

### `/app` - Application Pages & API Routes

#### **Public Pages** (No auth required)
| File Path | Status | Description |
|-----------|--------|-------------|
| `app/page.tsx` | ✅ **Functional** | Landing page with hero section, value props, animated mockups, CTA buttons |
| `app/about/page.tsx` | ✅ Functional | About page for company info |
| `app/how-it-works/page.tsx` | ✅ Functional | Explains the 3-step process (describe → AI refine → export) |
| `app/privacy/page.tsx` | ✅ Functional | Privacy policy |
| `app/terms/page.tsx` | ✅ Functional | Terms of service |
| `app/security/page.tsx` | ✅ Functional | Security information page |
| `app/contact/page.tsx` | ✅ Functional | Contact form/information |
| `app/blog/page.tsx` | ✅ Functional | Blog listing page |
| `app/blog/[slug]/page.tsx` | ✅ Functional | Individual blog post page (dynamic route) |
| `app/guides/page.tsx` | ✅ Functional | Manufacturing guides directory |

#### **Academy Section** (Educational content)
| File Path | Status | Description |
|-----------|--------|-------------|
| `app/academy/courses/page.tsx` | ⚠️ **Placeholder** | Course catalog (likely static/minimal) |
| `app/academy/playbooks/page.tsx` | ⚠️ Placeholder | Playbook library |
| `app/academy/templates/page.tsx` | ⚠️ Placeholder | Template downloads |

#### **User Dashboard & Projects**
| File Path | Status | Description |
|-----------|--------|-------------|
| `app/dashboard/page.tsx` | ✅ **Functional** | User dashboard showing projects, RFQs, notifications |
| `app/playbook-wizard/page.tsx` | ✅ **Functional** | Multi-step wizard for creating product playbook |
| `app/playbook-summary/page.tsx` | ✅ Functional | View generated playbook with financials, timeline, BOM |
| `app/projects/new/page.tsx` | ✅ Functional | Create new project (likely redirects to wizard) |
| `app/projects/[id]/page.tsx` | ✅ **Functional** | Project detail page with AI analysis, roadmap, suppliers, etc. |
| `app/projects/[id]/samples/page.tsx` | ⚠️ **Partial** | Sample management (UI exists, functionality limited) |

#### **RFQ (Request for Quote) System**
| File Path | Status | Description |
|-----------|--------|-------------|
| `app/rfqs/page.tsx` | ✅ **Functional** | List all user's RFQs with status tracking |
| `app/rfqs/[id]/page.tsx` | ✅ **Functional** | RFQ detail page with quote comparison |

#### **Manufacturer & Partner Directory**
| File Path | Status | Description |
|-----------|--------|-------------|
| `app/manufacturers/page.tsx` | ✅ **Functional** | Browse manufacturers with filters |
| `app/manufacturers/[id]/page.tsx` | ✅ **Functional** | Manufacturer profile with reviews, capabilities |
| `app/shipping-partners/page.tsx` | ✅ Functional | Shipping/logistics partner directory |
| `app/shipping-partners/[id]/page.tsx` | ✅ Functional | Shipping partner detail page |
| `app/legal-services/page.tsx` | ✅ Functional | Legal service providers for IP/contracts |

#### **Agents/Sourcing Agents** (Human experts)
| File Path | Status | Description |
|-----------|--------|-------------|
| `app/agents/page.tsx` | ⚠️ **Dummy Data** | List of sourcing agents (uses `lib/dummyAgents.ts`) |
| `app/agents/[id]/page.tsx` | ⚠️ Dummy Data | Agent profile page |

#### **Messaging System**
| File Path | Status | Description |
|-----------|--------|-------------|
| `app/messages/page.tsx` | ✅ **Functional** | Conversation inbox (partners/manufacturers) |

#### **Partner Portal** (For manufacturers/suppliers)
| File Path | Status | Description |
|-----------|--------|-------------|
| `app/partner/page.tsx` | ✅ **Functional** | Partner landing/dashboard |
| `app/partner/layout.tsx` | ✅ Functional | Partner-specific layout wrapper |
| `app/partner/dashboard/page.tsx` | ✅ Functional | Partner dashboard (view RFQs, submit quotes) |
| `app/partner/projects/page.tsx` | ✅ Functional | Projects visible to partner |
| `app/partner/projects/[id]/page.tsx` | ✅ Functional | Project detail for partners |

#### **User Account Management**
| File Path | Status | Description |
|-----------|--------|-------------|
| `app/account/profile/page.tsx` | ✅ **Functional** | User profile editor |
| `app/account/settings/page.tsx` | ✅ Functional | Account settings (notifications, preferences) |

#### **Admin Panel** (Role-protected)
| File Path | Status | Description |
|-----------|--------|-------------|
| `app/admin/layout.tsx` | ✅ **Functional** | Admin layout (checks role via middleware) |
| `app/admin/page.tsx` | ✅ **Functional** | Admin dashboard overview |
| `app/admin/users/page.tsx` | ✅ Functional | User management (CRUD operations) |
| `app/admin/suppliers/page.tsx` | ✅ Functional | Supplier/manufacturer management |
| `app/admin/projects/page.tsx` | ✅ Functional | View all projects across users |
| `app/admin/rfqs/page.tsx` | ✅ Functional | Monitor all RFQ submissions |
| `app/admin/logs/page.tsx` | ✅ Functional | Activity logs with filtering |
| `app/admin/settings/page.tsx` | ✅ Functional | System-wide settings |
| `app/admin/content/page.tsx` | ✅ Functional | Content management hub |
| `app/admin/content/blogs/page.tsx` | ✅ Functional | Blog post management |
| `app/admin/content/blogs/new/page.tsx` | ✅ Functional | Create new blog post |
| `app/admin/content/blogs/[id]/edit/page.tsx` | ✅ Functional | Edit existing blog post |
| `app/admin/content/blogs/comments/page.tsx` | ✅ Functional | Moderate blog comments |
| `app/admin/ai-rules/page.tsx` | ✅ Functional | Configure AI prompt templates/rules |

#### **Root App Files**
| File Path | Status | Description |
|-----------|--------|-------------|
| `app/layout.tsx` | ✅ **Functional** | Root layout with Navbar, Footer, AuthProvider |
| `app/template.tsx` | ✅ Functional | Page transition template (if used) |

---

### `/app/api` - Backend API Routes

#### **Playbook Generation**
| Endpoint | Status | Description |
|----------|--------|-------------|
| `POST /api/playbook` | ✅ **Functional** | Generate initial playbook from user input |
| `POST /api/playbook/analyze` | ✅ Functional | Deep analysis of playbook feasibility |
| `POST /api/playbook/snapshot` | ✅ Functional | Create frozen snapshot for project creation |
| `POST /api/generate-playbook` | ✅ Functional | Alternative playbook generation endpoint |

#### **Wizard (Guided Playbook Creation)**
| Endpoint | Status | Description |
|----------|--------|-------------|
| `POST /api/wizard/analyze` | ✅ **Functional** | Analyze user's product idea |
| `POST /api/wizard/components` | ✅ Functional | Generate component breakdown |
| `POST /api/wizard/cost-estimate` | ✅ Functional | Calculate cost estimates |
| `POST /api/wizard/questions` | ✅ Functional | Generate contextual questions |
| `POST /api/wizard/plan` | ✅ Functional | Create manufacturing plan |
| `POST /api/wizard/image-intake` | ✅ Functional | Process uploaded product images |

#### **Project Management**
| Endpoint | Status | Description |
|----------|--------|-------------|
| `POST /api/projects/create-from-snapshot` | ✅ **Functional** | Create project from playbook snapshot |
| `GET /api/projects/[id]/download-summary` | ✅ Functional | Download project as PDF |
| `GET /api/project-category` | ✅ Functional | Fetch project categories |

#### **RFQ System**
| Endpoint | Status | Description |
|----------|--------|-------------|
| `POST /api/rfq/submit` | ✅ **Functional** | Submit RFQ to manufacturers |

#### **Quotes Management**
| Endpoint | Status | Description |
|----------|--------|-------------|
| `GET /api/quotes` | ✅ **Functional** | Fetch quotes for user |
| `POST /api/quotes` | ✅ Functional | Partners submit quotes |
| `GET /api/quotes/[id]` | ✅ Functional | Get quote details |
| `PATCH /api/quotes/[id]` | ✅ Functional | Update quote status (accept/reject) |

#### **QC (Quality Control)**
| Endpoint | Status | Description |
|----------|--------|-------------|
| `POST /api/qc/generate` | ✅ **Functional** | Generate QC checklist for project |

#### **Messaging System**
| Endpoint | Status | Description |
|----------|--------|-------------|
| `GET /api/messages/conversations` | ✅ **Functional** | Get user's conversations |
| `POST /api/messages/conversations` | ✅ Functional | Create new conversation |
| `GET /api/messages/[id]` | ✅ Functional | Get conversation messages |
| `POST /api/messages/[id]` | ✅ Functional | Send message in conversation |

#### **Notifications**
| Endpoint | Status | Description |
|----------|--------|-------------|
| `GET /api/notifications` | ✅ **Functional** | Fetch user notifications |
| `POST /api/notifications/read` | ✅ Functional | Mark notifications as read |

#### **NDA Management**
| Endpoint | Status | Description |
|----------|--------|-------------|
| `POST /api/nda/accept` | ✅ **Functional** | User accepts NDA for project |
| `GET /api/nda/status` | ✅ Functional | Check NDA acceptance status |

#### **Reviews**
| Endpoint | Status | Description |
|----------|--------|-------------|
| `GET /api/reviews` | ✅ **Functional** | Fetch reviews for partners |
| `POST /api/reviews` | ✅ Functional | Submit review |
| `GET /api/reviews/[partnerId]/user` | ✅ Functional | Get user's review for partner |

#### **Chat (AI Assistant)**
| Endpoint | Status | Description |
|----------|--------|-------------|
| `POST /api/chat` | ✅ **Functional** | Chat with ManuBot AI assistant |

#### **Admin Endpoints**
| Endpoint | Status | Description |
|----------|--------|-------------|
| `GET /api/admin/users` | ✅ **Functional** | List/manage users |
| `POST /api/admin/users` | ✅ Functional | Create/update users |
| `GET /api/admin/suppliers` | ✅ Functional | Manage suppliers |
| `POST /api/admin/suppliers` | ✅ Functional | Add/edit suppliers |
| `GET /api/admin/projects` | ✅ Functional | View all projects |
| `GET /api/admin/rfqs` | ✅ Functional | View all RFQs |
| `GET /api/admin/logs` | ✅ Functional | Fetch activity logs |
| `POST /api/admin/logs/export` | ✅ Functional | Export logs to CSV |
| `GET /api/admin/settings` | ✅ Functional | Get system settings |
| `POST /api/admin/settings` | ✅ Functional | Update settings |
| `GET /api/admin/content` | ✅ Functional | Content management |
| `POST /api/admin/content` | ✅ Functional | Create/edit content |
| `GET /api/admin/ai-prompts` | ✅ Functional | Manage AI prompt templates |
| `POST /api/admin/ai-prompts` | ✅ Functional | Update AI prompts |

---

### `/components` - React Components

#### **Core Layout Components**
| File | Status | Description |
|------|--------|-------------|
| `AuthProvider.tsx` | ✅ **Functional** | Supabase auth context provider |
| `Navbar.tsx` | ✅ **Functional** | Main navigation with auth state, notifications bell |
| `Footer.tsx` | ✅ Functional | Site footer with links |
| `LoginModal.tsx` | ✅ Functional | Login modal (email/password) |
| `RegisterModal.tsx` | ✅ Functional | Registration modal |

#### **AI & Chat**
| File | Status | Description |
|------|--------|-------------|
| `ChatWidget.tsx` | ✅ **Functional** | Floating ManuBot chat widget (OpenAI integration) |

#### **NDA Management**
| File | Status | Description |
|------|--------|-------------|
| `NdaConsentModal.tsx` | ✅ **Functional** | Modal for users to accept NDA terms |

#### **Feasibility & Analysis**
| File | Status | Description |
|------|--------|-------------|
| `FeasibilityCard.tsx` | ✅ **Functional** | Complex card showing manufacturability, cost, competition scores |

#### **PDF Generation**
| File | Status | Description |
|------|--------|-------------|
| `PlaybookPdfDocument.tsx` | ✅ **Functional** | Generate playbook PDF (@react-pdf/renderer) |
| `pdf/ProjectSummaryPDF.tsx` | ✅ Functional | Project summary PDF template |
| `pdf/DownloadPDFButton.tsx` | ✅ Functional | Button trigger for PDF download |

---

#### **Playbook Components** (`components/playbook/`)
| File | Status | Description |
|------|--------|-------------|
| `PlaybookHeader.tsx` | ✅ **Functional** | Product name, category display |
| `PlaybookKeyInfo.tsx` | ✅ Functional | Quick stats (MOQ, cost, timeline) |
| `PlaybookFinancials.tsx` | ✅ **Functional** | Interactive financial model with sliders |
| `PlaybookBOM.tsx` | ✅ Functional | Bill of materials table |
| `PlaybookMaterialsFeatures.tsx` | ✅ Functional | Materials and key features list |
| `PlaybookApproachRisks.tsx` | ✅ Functional | Manufacturing approach and risks |
| `PlaybookTimelineNext.tsx` | ✅ Functional | Timeline visualization |
| `PlaybookInsights.tsx` | ✅ Functional | AI insights and recommendations |
| `PlaybookActions.tsx` | ✅ Functional | Action buttons (create project, download) |
| `PlaybookStickyBar.tsx` | ✅ Functional | Sticky CTA bar |
| `PlaybookPremiumUpsell.tsx` | ⚠️ Placeholder | Premium feature upsell |
| `ProjectCreationModal.tsx` | ✅ Functional | Modal for confirming project creation |

---

#### **Project Components** (`components/project/`)
| File | Status | Description |
|------|--------|-------------|
| `ProjectShell.tsx` | ✅ **Functional** | Main project layout wrapper |
| `ProjectHeader.tsx` | ✅ Functional | Project title, status, actions |
| `ProjectSidebar.tsx` | ✅ Functional | Navigation sidebar |
| `ProjectKeyInfo.tsx` | ✅ Functional | Key metrics display |
| `ProjectFinancials.tsx` | ✅ Functional | Financial breakdown |
| `ProjectComponents.tsx` | ✅ Functional | Component list |
| `ProjectMaterials.tsx` | ✅ Functional | Materials specifications |
| `ProjectFeatures.tsx` | ✅ Functional | Key features |
| `ProjectTimeline.tsx` | ✅ Functional | Timeline/roadmap |
| `ProjectApproach.tsx` | ✅ Functional | Manufacturing approach |
| `ProjectRisks.tsx` | ✅ Functional | Risk analysis |
| `ProjectNextSteps.tsx` | ✅ Functional | Recommended next steps |
| `ProjectNotes.tsx` | ✅ Functional | User notes editor |
| `ProjectActivity.tsx` | ✅ Functional | Activity feed |
| `ProjectActivityLog.tsx` | ✅ Functional | Detailed activity log |
| `ProjectProductSpecs.tsx` | ✅ Functional | Product specifications |
| `ProjectSamples.tsx` | ⚠️ **Partial** | Sample management UI |
| `OpportunityScore.tsx` | ✅ **Functional** | Opportunity assessment (0-100 score) |
| `ComponentBreakdown.tsx` | ✅ Functional | Detailed component analysis |
| `BOMDraft.tsx` | ✅ Functional | Bill of materials draft |
| `CertificationMap.tsx` | ✅ Functional | Required certifications (FCC, CE, UL) |
| `ProjectCompliance.tsx` | ✅ Functional | Compliance requirements |
| `IPStrategy.tsx` | ✅ Functional | Intellectual property strategy |
| `SupplierAnalysis.tsx` | ✅ Functional | Supplier recommendations |
| `RiskMap.tsx` | ✅ Functional | Business + manufacturing risks |
| `FounderCoaching.tsx` | ✅ Functional | AI coaching and guidance |
| `MissingInfoScanner.tsx` | ✅ Functional | Information gaps identifier |
| `ProjectRoadmapModal.tsx` | ✅ Functional | Roadmap phase modal |
| `ProjectPlaybookModal.tsx` | ✅ Functional | View original playbook |
| `ProjectPremiumCTA.tsx` | ⚠️ Placeholder | Premium upsell |

---

#### **Wizard Components** (`components/wizard/`)
| File | Status | Description |
|------|--------|-------------|
| `WizardModal.tsx` | ✅ **Functional** | Multi-step wizard UI (46KB - complex) |
| `WizardContext.tsx` | ✅ Functional | React context for wizard state |

---

#### **Sample Management** (`components/samples/`)
| File | Status | Description |
|------|--------|-------------|
| `SampleEvaluation.tsx` | ✅ **Functional** | Approve/request revision UI |
| `SamplePhotos.tsx` | ⚠️ **Partial** | Photo upload/display |
| `QCChecklist.tsx` | ⚠️ Partial | Quality control checklist |
| `SampleStatusTracker.tsx` | ⚠️ Partial | Sample status timeline |

---

#### **Quotes & Comparison** (`components/quotes/`)
| File | Status | Description |
|------|--------|-------------|
| `QuotesComparison.tsx` | ✅ **Functional** | Side-by-side quote comparison table with highlighting |
| `QuoteSubmissionForm.tsx` | ✅ Functional | Form for partners to submit quotes |

---

#### **RFQ Components** (`components/rfq/`)
| File | Status | Description |
|------|--------|-------------|
| `RFQCard.tsx` | ✅ **Functional** | RFQ summary card for listings |

---

#### **Sourcing** (`components/sourcing/`)
| File | Status | Description |
|------|--------|-------------|
| `RFQBuilder.tsx` | ✅ **Functional** | Form to create RFQ from project |

---

#### **Messaging** (`components/messaging/`)
| File | Status | Description |
|------|--------|-------------|
| `NotificationBell.tsx` | ✅ **Functional** | Notification dropdown with realtime updates |

---

#### **Reviews** (`components/reviews/`)
| File | Status | Description |
|------|--------|-------------|
| `ReviewForm.tsx` | ✅ **Functional** | Submit review for manufacturer |
| `ReviewsList.tsx` | ✅ Functional | Display reviews list |
| `StarRating.tsx` | ✅ Functional | Star rating component |

---

#### **Partner/Manufacturer Components** (`components/partners/`)
| File | Status | Description |
|------|--------|-------------|
| `PartnersPage.tsx` | ✅ **Functional** | Partner directory page component |
| `PartnerCard.tsx` | ✅ Functional | Partner card in listings |
| `PartnerProfile.tsx` | ✅ Functional | Full partner profile view |
| `PartnerFilters.tsx` | ✅ Functional | Filter/search partners |

---

#### **Admin Components** (`components/admin/`)
| File | Status | Description |
|------|--------|-------------|
| `SupplierTable.tsx` | ✅ **Functional** | Admin table for suppliers |
| `SupplierCard.tsx` | ✅ Functional | Supplier card view |
| `SupplierDrawer.tsx` | ✅ Functional | Drawer for supplier details |
| `RFQDrawer.tsx` | ✅ Functional | Admin view of RFQ details |
| `Toast.tsx` | ✅ Functional | Toast notification component |
| `PromptEditor.tsx` | ✅ Functional | Edit AI prompt templates |
| `ContentEditor.tsx` | ✅ Functional | Content management editor |

---

#### **Blog Components** (`components/blog/`)
| File | Status | Description |
|------|--------|-------------|
| `BlogEditor.tsx` | ✅ **Functional** | Rich text editor for blog posts |
| `CommentSection.tsx` | ✅ Functional | Blog comments UI |

---

#### **Legal Components** (`components/legal/`)
| File | Status | Description |
|------|--------|-------------|
| `LegalPageLayout.tsx` | ✅ **Functional** | Layout for legal pages (privacy, terms) |

---

#### **Settings Components** (`components/settings/`)
| File | Status | Description |
|------|--------|-------------|
| `DeleteNdaButton.tsx` | ✅ **Functional** | Button to revoke NDA acceptance |

---

### `/lib` - Utility Libraries

| File | Status | Description |
|------|--------|-------------|
| `supabaseClient.ts` | ✅ **Functional** | Supabase client initialization (54 bytes - minimal) |
| `feasibility.ts` | ✅ **Functional** | Feasibility scoring engine (17KB - complex logic) |
| `nda.ts` | ✅ Functional | NDA utility functions |
| `dummyAgents.ts` | ⚠️ **Dummy Data** | Hardcoded agent data (not connected to DB) |

---

### `/types` - TypeScript Definitions

| File | Status | Description |
|------|--------|-------------|
| `project.ts` | ✅ **Complete** | Project, AI analysis, BOM, certification, risk types (5KB) |
| `playbook.ts` | ✅ Complete | Playbook, wizard, snapshot, feasibility types (4.7KB) |
| `samples.ts` | ✅ Complete | Sample management types |
| `nda.ts` | ✅ Complete | NDA-related types |
| `blog.ts` | ✅ Complete | Blog post and comment types |

---

### `/supabase` - Database

| Directory/File | Status | Description |
|----------------|--------|-------------|
| `migrations/` | ✅ **Present** | SQL migration files for schema changes |
| `.temp/` | ⚠️ Empty | Temporary files folder |

**Additional SQL Files (root):**
- `supabase_rfq_submissions.sql` - RFQ table schema with RLS policies
- `schema_dump.sql` - Empty placeholder

---

### `/scripts` - Utility Scripts

| File | Status | Description |
|------|--------|-------------|
| `set-admin.js` | ✅ **Functional** | Script to set user as admin |
| `inspect-projects.js` | ✅ Functional | Debug script for project data |
| `inspect-partner.js` | ✅ Functional | Debug script for partner data |
| `check-nda-table.js` | ✅ Functional | Verify NDA table structure |

---

### `/middleware.ts` - Route Protection

| File | Status | Description |
|------|--------|-------------|
| `middleware.ts` | ✅ **Functional** | Protects `/admin` routes with role check |

---

## 🔍 Feature Status Summary

### ✅ **Fully Functional Features**
1. **User Authentication** - Email/password via Supabase
2. **Playbook Wizard** - Multi-step guided product definition
3. **AI Analysis** - Deep feasibility, cost, and manufacturing analysis
4. **Project Management** - Create, view, manage projects with AI insights
5. **RFQ System** - Submit requests to manufacturers
6. **Quote Comparison** - Side-by-side manufacturer quote analysis
7. **Notifications** - Real-time notifications with Supabase Realtime
8. **Messaging** - Conversations between users and partners
9. **Manufacturer Directory** - Browse and filter suppliers
10. **Partner Portal** - Manufacturers can view RFQs and submit quotes
11. **Admin Dashboard** - Full CRUD for users, suppliers, projects, content
12. **PDF Export** - Download playbooks and project summaries
13. **NDA Management** - Accept/track NDA agreements
14. **Reviews & Ratings** - Rate manufacturers
15. **Chat Widget (ManuBot)** - AI assistant for help
16. **Financial Modeling** - Interactive unit economics calculator
17. **Feasibility Scoring** - Manufacturability, cost, competition analysis
18. **Blog System** - Create/edit blog posts with comments

### ⚠️ **Partially Implemented / Limited**
1. **Sample Management** - UI exists, limited backend integration
2. **Academy Content** - Pages exist but likely static/minimal
3. **Agent Directory** - Uses dummy data (not DB-backed)
4. **Premium Features** - Upsell components present but no payment integration

### ❌ **Not Implemented / Missing**
1. **Payment Processing** - No Stripe/payment gateway integration
2. **E-signature for NDAs** - Currently just checkbox acceptance
3. **Advanced Messaging Features** - No file attachments, translation, templates
4. **Sample Photo Annotation** - No defect marking tools
5. **Timeline Tracking** - No actual vs. planned milestone tracking
6. **Cost Tracking** - No expense/invoice management
7. **Compliance Document Generator** - No auto-fill cert applications

---

## 🔐 Database Schema (Inferred from Code)

### Core Tables
- **users** (Supabase Auth)
- **projects** (id, user_id, title, playbook_snapshot, ai_analysis, created_at, updated_at)
- **rfq_submissions** (id, project_id, user_id, status, rfq_data, created_at)
- **quotes** (id, rfq_id, partner_id, unit_price, moq, lead_time_days, status, etc.)
- **partners** (id, user_id, name, type, region, rating, capabilities)
- **notifications** (id, user_id, type, title, message, link, read, created_at)
- **conversations** (id, customer_id, partner_id, partner_record_id, project_id, rfq_id, subject)
- **messages** (id, conversation_id, sender_id, content, read_by_customer, read_by_partner)
- **nda_consents** (id, user_id, project_id, accepted_at)
- **reviews** (id, user_id, partner_id, rating, comment, created_at)
- **samples** (id, project_id, status, notes, photos, created_at)
- **blog_posts** (id, title, slug, content, author_id, published_at)
- **blog_comments** (id, post_id, user_id, content, created_at)

### Row Level Security (RLS)
✅ **Enabled** on all user-facing tables with policies:
- Users can only view/edit their own data
- Admin role can access all data
- Partners can view relevant RFQs and projects

---

## 🚀 Key Workflows

### 1. Product Creation Flow
```
Landing Page → Playbook Wizard → AI Analysis → Playbook Summary → Create Project → Project Detail
```

### 2. Sourcing Flow
```
Project Detail → RFQ Builder → Submit to Manufacturers → Quotes Received → Quote Comparison → Accept Quote
```

### 3. Partner Flow
```
Partner Login → Dashboard → View RFQs → Submit Quote → Message Customer → Track Order
```

### 4. Admin Flow
```
Admin Login → Dashboard → Manage Users/Suppliers/Projects → View Logs → Configure AI Prompts
```

---

## 📊 Code Complexity Metrics

| Category | File Count | Complexity |
|----------|-----------|-----------|
| App Pages | 75 | Medium |
| API Routes | 40+ | High |
| Components | 80+ | High |
| Types | 5 | Medium |
| Utils/Lib | 4 | Medium-High |

**Total Lines of Code**: ~50,000+ (estimated)

---

## 🔧 Configuration Files

- **TypeScript**: `tsconfig.json` - Strict mode enabled
- **ESLint**: `eslint.config.mjs` - Next.js recommended config
- **Tailwind**: Uses v4 (config in `postcss.config.mjs`)
- **Next.js**: `next.config.ts` - Standard configuration

---

## 🌟 Notable Technical Highlights

1. **Type Safety**: Comprehensive TypeScript types across entire codebase
2. **RLS Security**: Database-level security with Supabase RLS
3. **AI Integration**: OpenAI for playbook generation, feasibility analysis, chat
4. **Real-time Features**: Supabase Realtime for notifications and messages
5. **PDF Generation**: Server-side PDF creation with React components
6. **Middleware Protection**: Role-based admin access control
7. **Component Organization**: Feature-based folder structure
8. **Complex State Management**: Wizard uses React Context for multi-step flow
9. **Financial Modeling**: Interactive calculations with user overrides
10. **Sophisticated Scoring**: Deterministic feasibility engine with 15+ factors

---

## 📝 Notes for AI Context

### What Works Well
- Core product creation and analysis flow is solid
- Admin panel is comprehensive
- Type system provides excellent guardrails
- RFQ and quote comparison features are functional
- Messaging system has real-time capabilities

### What Needs Enhancement
- Sample management needs backend completion
- Agent directory should connect to real database
- Premium features need payment integration
- Messaging could use file uploads and translation
- Timeline tracking needs actual vs. planned comparison
- Cost tracking completely missing

### Architecture Strengths
- Clean separation of concerns
- Reusable component structure
- Strong type definitions
- Security-first approach with RLS
- Scalable API design

### Technical Debt
- Some dummy data still in use (agents)
- Academy content appears minimal
- Premium features not fully implemented
- No automated testing visible

---

**End of Documentation**
