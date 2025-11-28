# ManuPilot - Next Feature Suggestions

**Generated**: 2025-11-28
**Purpose**: Comprehensive feature recommendations for next development phase

---

## 🎯 Executive Summary

Based on analysis of the current ManuPilot codebase, these features would provide the highest value-add for users and complete critical gaps in the manufacturing sourcing workflow.

**Priority Tiers:**
- **P0 (Critical)**: Closes major workflow gaps, high user impact
- **P1 (High)**: Enhances core features, competitive advantage
- **P2 (Medium)**: Nice-to-have improvements

---

## 🏆 P0: Critical Features

### 1. Manufacturer Quote Comparison Dashboard

**Priority**: P0 - Critical
**Why**: You generate RFQs but lack tools to compare responses effectively
**Effort**: Medium (2-3 weeks)
**Impact**: Very High

#### What It Includes:
- Side-by-side quote comparison in sortable table
- AI-powered quote analysis (extract pricing, MOQ, lead times from unstructured text)
- Automated red flag detection (unrealistic prices, suspicious terms)
- Normalized scoring based on user-defined criteria weights
- Negotiation history tracking
- Decision matrix with visual recommendations
- Export comparison as PDF/CSV

#### Technical Implementation:

**Database Schema:**
```sql
CREATE TABLE rfq_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID REFERENCES rfq_submissions(id),
  manufacturer_id UUID REFERENCES partners(id),
  user_id UUID REFERENCES auth.users(id),

  -- Raw quote data
  raw_quote_text TEXT,
  quote_file_url TEXT,

  -- AI-extracted metrics
  extracted_metrics JSONB DEFAULT '{}', -- {unit_price, moq, lead_time, payment_terms, etc.}

  -- AI analysis
  ai_analysis JSONB DEFAULT '{}', -- {quality_score, red_flags[], green_flags[], notes}

  -- Negotiation tracking
  negotiation_rounds JSONB DEFAULT '[]', -- [{round: 1, price: 10.50, date: "..."}]

  status TEXT DEFAULT 'received', -- received, under_review, accepted, rejected, negotiating

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**API Endpoints:**
```typescript
POST /api/rfq/[id]/responses/analyze
  - Upload quote document or paste text
  - AI extracts key metrics and analyzes quality

GET /api/rfq/[id]/comparison
  - Returns all quotes with normalized scores

PATCH /api/rfq/[id]/responses/[responseId]/negotiate
  - Track negotiation counter-offers
```

**Components:**
```typescript
components/quotes/
  ├── QuoteComparisonMatrix.tsx      // Main comparison table
  ├── QuoteAnalysisPanel.tsx         // AI insights sidebar
  ├── QuoteScoreCard.tsx             // Individual quote scorecard
  ├── NegotiationTracker.tsx         // Track price negotiations
  └── DecisionMatrix.tsx             // Weighted criteria decision tool
```

**User Flow:**
1. User receives quotes from manufacturers (email, PDF, or text)
2. Upload/paste into ManuPilot
3. AI extracts pricing, MOQ, lead time, terms
4. System flags issues ("Lead time is 3x industry average", "Price seems too low for stated quality")
5. User sets criteria weights (40% price, 30% quality, 20% lead time, 10% MOQ)
6. View ranked recommendations
7. Start negotiation with top 2-3 suppliers
8. Accept winning quote

**AI Prompts Needed:**
```
System: You are a manufacturing quote analyzer. Extract the following from this quote:
- Unit price (with currency)
- MOQ (minimum order quantity)
- Lead time (in days)
- Payment terms
- Shipping/Incoterms
- Quality certifications mentioned
- Tooling costs (if applicable)

Then analyze for red flags and green flags.
```

---

### 2. Sample Management & Feedback Loop

**Priority**: P0 - Critical
**Why**: Sample iteration is core to manufacturing but poorly supported
**Effort**: Medium (2-3 weeks)
**Impact**: Very High

#### What It Includes:
- Sample request workflow with pre-flight checklist
- Photo upload with annotation tools (mark defects, add comments on image)
- Structured feedback forms mapped to BOM and QC checklist
- Version tracking (Sample 1 → Sample 2 → Sample 3 → Production)
- AI-powered quality comparison against specs
- Collaborative review (invite team/stakeholders)
- Sample timeline and status tracker

#### Technical Implementation:

**Database Schema:**
```sql
CREATE TABLE sample_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  manufacturer_id UUID REFERENCES partners(id),
  user_id UUID REFERENCES auth.users(id),

  version_number INT DEFAULT 1,
  status TEXT DEFAULT 'requested', -- requested, in_production, shipped, received, evaluating, approved, rejected

  -- Checklist items to verify
  checklist_items JSONB DEFAULT '[]', -- [{item: "Check wall thickness", status: "pending"}]

  -- Photos with annotations
  photos JSONB DEFAULT '[]', -- [{url: "...", annotations: [{x, y, comment, type: "defect|question"}]}]

  -- Structured feedback
  feedback_data JSONB DEFAULT '{}', -- Mapped to BOM components

  -- AI quality score
  ai_quality_analysis JSONB DEFAULT '{}', -- {overall_score, deviations: [{spec, expected, actual}]}

  evaluator_notes TEXT,
  decision TEXT, -- approved, revision_required, rejected

  requested_at TIMESTAMPTZ DEFAULT NOW(),
  received_at TIMESTAMPTZ,
  evaluated_at TIMESTAMPTZ
);

CREATE TABLE sample_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  sample_ids UUID[], -- Array of sample IDs being compared
  comparison_notes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**API Endpoints:**
```typescript
POST /api/projects/[id]/samples/request
  - Create sample request with checklist

POST /api/samples/[id]/photos/upload
  - Upload photos with automatic AI analysis

POST /api/samples/[id]/annotate
  - Add annotations to photos (defect markers)

POST /api/samples/[id]/evaluate
  - Submit structured feedback and decision

GET /api/samples/[id]/comparison
  - Compare current sample to previous versions or specs
```

**Components:**
```typescript
components/samples/
  ├── SampleRequestWizard.tsx        // Multi-step sample request form
  ├── SamplePhotoUploader.tsx        // Drag-drop photo upload
  ├── PhotoAnnotationTool.tsx        // Canvas-based defect marking
  ├── SampleFeedbackForm.tsx         // Structured feedback (per BOM item)
  ├── SampleComparisonView.tsx       // Side-by-side version comparison
  ├── SampleTimeline.tsx             // Visual timeline of sample iterations
  ├── AIQualityReport.tsx            // AI-generated quality assessment
  └── CollaborativeReview.tsx        // Multi-stakeholder feedback
```

**User Flow:**
1. User selects "Request Sample" from project page
2. System generates checklist based on project specs
3. User adds custom check items
4. Sample arrives → User uploads photos
5. User marks defects directly on photos ("Wall too thin here", "Color mismatch")
6. AI compares photos to spec drawings (if available) and flags deviations
7. User fills structured feedback form mapped to each BOM component
8. Decision: Approve for production OR Request revisions with specific notes
9. If revision needed, new sample request created (Sample V2) with changes highlighted
10. Compare V1 vs V2 photos side-by-side

**AI Features:**
- Photo analysis: "Detected surface finish inconsistency in top-right corner"
- Spec comparison: "Measured hole diameter appears 0.3mm smaller than spec"
- Historical learning: "This manufacturer's samples typically require 1-2 iterations for [component type]"

---

## 🚀 P1: High-Value Features

### 3. Real-Time Manufacturer Messaging

**Priority**: P1 - High
**Why**: Email is slow; in-app messaging speeds up negotiations
**Effort**: Medium (2 weeks)
**Impact**: High

#### What It Includes:
- Thread-based chat per RFQ or project
- File attachments (CAD files, technical drawings, contracts)
- AI assistant suggests message drafts based on context
- Automatic translation for international manufacturers
- Read receipts and typing indicators
- Message templates for common scenarios
- Search within conversations

#### Technical Implementation:

**Database Enhancement:**
```sql
-- Add to existing messages table
ALTER TABLE messages ADD COLUMN attachments JSONB DEFAULT '[]';
ALTER TABLE messages ADD COLUMN message_type TEXT DEFAULT 'text'; -- text, file, system
ALTER TABLE messages ADD COLUMN translated_content JSONB DEFAULT '{}'; -- {zh: "...", es: "..."}
ALTER TABLE messages ADD COLUMN ai_suggested BOOLEAN DEFAULT false;

CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  category TEXT, -- quote_question, shipping_inquiry, quality_issue, negotiation
  name TEXT,
  content TEXT,
  placeholders JSONB DEFAULT '[]', -- [{key: "manufacturer_name", label: "Manufacturer"}]
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**API Endpoints:**
```typescript
POST /api/messages/[conversationId]/upload
  - Upload file attachments

POST /api/messages/[conversationId]/translate
  - Translate message to target language

POST /api/messages/suggest-reply
  - AI generates suggested response based on conversation context

GET /api/messages/templates
  - Fetch user's message templates
```

**Components:**
```typescript
components/messaging/
  ├── MessageThread.tsx              // Real-time message list
  ├── MessageComposer.tsx            // Rich text input with attachments
  ├── FileAttachmentCard.tsx         // Preview attached files
  ├── TranslationToggle.tsx          // Show original/translated
  ├── AISuggestedReply.tsx           // AI-generated response options
  ├── MessageTemplateSelector.tsx    // Quick templates dropdown
  └── TypingIndicator.tsx            // "Sarah is typing..."
```

**Realtime Integration:**
```typescript
// Subscribe to new messages
const channel = supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, (payload) => {
    // Add new message to UI
    addMessage(payload.new);
  })
  .subscribe();
```

**AI Context-Aware Suggestions:**
```
Context: User is negotiating price down from $12.50 to $10.00 per unit
Conversation history: Manufacturer initially quoted $12.50, cited material costs

Suggested replies:
1. "I appreciate the transparency on material costs. Would a larger MOQ (1000 vs 500) help bring the unit price closer to $10?"
2. "Could we explore alternative materials that meet our specs but reduce cost?"
3. "We're flexible on lead time if that helps optimize your production scheduling and pricing."
```

---

### 4. Project Timeline & Milestone Tracker

**Priority**: P1 - High
**Why**: AI generates roadmaps but no way to track actual progress
**Effort**: Medium (2 weeks)
**Impact**: High

#### What It Includes:
- Gantt chart visualization of roadmap phases
- Actual vs. planned timeline comparison
- Milestone completion with evidence (upload proof: sample photos, certs, contracts)
- Automated delay alerts
- Critical path highlighting
- Dependency management (can't start Phase 3 until Phase 2 done)
- Timeline adjustment with impact analysis

#### Technical Implementation:

**Database Schema:**
```sql
CREATE TABLE project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  phase_id UUID, -- Links to RoadmapPhase from AI analysis

  name TEXT,
  description TEXT,
  dependencies UUID[], -- Array of milestone IDs this depends on
  on_critical_path BOOLEAN DEFAULT false,

  -- Timeline
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,

  status TEXT DEFAULT 'not_started', -- not_started, in_progress, blocked, completed, delayed

  -- Completion evidence
  completion_evidence JSONB DEFAULT '[]', -- [{type: "photo|document|note", url: "...", notes: "..."}]

  -- Variance tracking
  days_variance INT, -- Positive = delayed, negative = early

  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE timeline_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  milestone_id UUID REFERENCES project_milestones(id),

  old_date DATE,
  new_date DATE,
  reason TEXT,
  impact_analysis JSONB, -- Which other milestones are affected

  adjusted_by UUID REFERENCES auth.users(id),
  adjusted_at TIMESTAMPTZ DEFAULT NOW()
);
```

**API Endpoints:**
```typescript
GET /api/projects/[id]/timeline
  - Fetch all milestones with variance analysis

POST /api/projects/[id]/milestones/[milestoneId]/complete
  - Mark milestone as complete with evidence

PATCH /api/projects/[id]/milestones/[milestoneId]/adjust
  - Adjust dates and analyze impact on dependencies

GET /api/projects/[id]/critical-path
  - Calculate critical path through all milestones
```

**Components:**
```typescript
components/project/timeline/
  ├── GanttChart.tsx                 // Visual timeline (use library like react-gantt-chart)
  ├── MilestoneCard.tsx              // Individual milestone detail
  ├── CriticalPathView.tsx           // Highlight critical path milestones
  ├── VarianceReport.tsx             // Actual vs planned analysis
  ├── MilestoneCompletionModal.tsx   // Upload proof of completion
  ├── TimelineAdjustmentTool.tsx     // Drag to adjust dates, see impact
  └── DelayAlertBanner.tsx           // Show delayed milestones
```

**User Flow:**
1. AI generates initial roadmap with phases (from project creation)
2. System converts phases into milestones with dates
3. User adjusts dates if needed
4. As project progresses, user marks milestones complete with evidence
5. System calculates variance and alerts if behind schedule
6. If delay occurs, user can drag milestone to new date
7. System shows impact: "Adjusting Sample Approval by 2 weeks will delay Production Start and Final Delivery"
8. User can reassign milestones to team members

**Notifications:**
```
"🚨 Milestone Overdue: 'Sample Approval' was due 3 days ago. Update status or adjust timeline."
"⚠️ Critical Path Alert: 'Tooling Complete' is delayed by 5 days, affecting final delivery."
"✅ Milestone Complete: 'Certification Submitted' marked as done by Sarah."
```

---

### 5. Compliance Document Generator

**Priority**: P1 - High
**Why**: You track certification requirements but don't help users apply
**Effort**: High (3-4 weeks)
**Impact**: High

#### What It Includes:
- Auto-generate certification applications (FCC, CE, UL, RoHS, etc.)
- Pre-fill from project specifications
- Guided checklists for each certification
- Testing lab recommendations based on product category
- Cost tracking for compliance expenses
- Document repository with version control
- Deadline tracking and reminders

#### Technical Implementation:

**Database Schema:**
```sql
CREATE TABLE certification_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),

  certification_type TEXT, -- FCC, CE, UL, RoHS, FDA, etc.
  target_markets TEXT[], -- ["USA", "EU", "China"]

  -- Application data
  application_data JSONB, -- Pre-filled from project specs
  generated_document_url TEXT, -- PDF of application

  status TEXT DEFAULT 'draft', -- draft, submitted, testing, approved, rejected

  -- Testing lab
  testing_lab_id UUID REFERENCES partners(id),
  testing_lab_quote JSONB,
  testing_cost NUMERIC(10,2),

  -- Timeline
  deadline DATE,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,

  -- Documents
  supporting_docs JSONB DEFAULT '[]', -- [{type: "test_report", url: "..."}]
  certificate_url TEXT,
  certificate_expiry DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE certification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_type TEXT UNIQUE,
  regions TEXT[],

  required_fields JSONB, -- Field mapping to project specs
  template_pdf_url TEXT,
  checklist JSONB, -- [{step: "Submit technical drawings", completed: false}]

  typical_cost_range TEXT,
  typical_timeline TEXT,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**API Endpoints:**
```typescript
POST /api/projects/[id]/certifications/generate
  - Generate certification application from template

POST /api/certifications/[id]/submit
  - Submit to testing lab

GET /api/certifications/labs
  - Get recommended testing labs for product type

PATCH /api/certifications/[id]/update-status
  - Track certification progress
```

**Components:**
```typescript
components/compliance/
  ├── CertificationWizard.tsx        // Multi-step certification setup
  ├── ApplicationGenerator.tsx       // Auto-fill and generate PDF
  ├── CertificationChecklist.tsx     // Step-by-step requirements
  ├── TestingLabDirectory.tsx        // Browse and compare labs
  ├── ComplianceTimeline.tsx         // Track deadlines
  ├── DocumentRepository.tsx         // Store all certs and test reports
  └── ComplianceCostTracker.tsx      // Budget for cert expenses
```

**Example Auto-Fill Logic:**
```typescript
// FCC Application Auto-Fill
function generateFCCApplication(project: Project) {
  return {
    applicant_name: project.user.company_name,
    product_name: project.title,
    product_description: project.playbook_snapshot.final_edits.summary,

    // From AI Analysis
    operating_frequency: extractFromSpecs(project, 'frequency'),
    power_consumption: extractFromSpecs(project, 'power'),

    // From BOM
    components: project.ai_analysis.bom_draft.map(item => ({
      part_number: item.part_number,
      description: item.description,
      manufacturer: item.supplier_type
    })),

    // Pre-fill testing requirements
    required_tests: ['Radiated Emissions', 'Conducted Emissions', 'Power Line Harmonics'],

    // Estimated cost
    estimated_cost: '$5,000 - $8,000',
    estimated_timeline: '4-6 weeks'
  };
}
```

**Checklist Example (CE Marking):**
```json
{
  "certification_type": "CE",
  "checklist": [
    {
      "step": "Identify applicable EU directives",
      "details": "For your product: Low Voltage Directive (LVD), EMC Directive",
      "completed": false
    },
    {
      "step": "Prepare technical documentation",
      "details": "Includes: Design drawings, BOM, risk analysis, test reports",
      "completed": false
    },
    {
      "step": "Conduct conformity assessment",
      "details": "Select notified body for testing (see recommended labs)",
      "completed": false
    },
    {
      "step": "Issue Declaration of Conformity",
      "details": "Template will be auto-generated once testing complete",
      "completed": false
    },
    {
      "step": "Affix CE marking to product",
      "details": "Size requirements: Must be at least 5mm tall",
      "completed": false
    }
  ]
}
```

---

### 6. Cost Tracking & Budget Management

**Priority**: P1 - High
**Why**: Estimates exist everywhere but no "actuals" tracking
**Effort**: Medium (2-3 weeks)
**Impact**: High

#### What It Includes:
- Budget planning using AI estimates as baseline
- Expense tracking with invoice upload and OCR parsing
- Budget vs. actual comparison dashboard
- Burn rate and project runway calculations
- Category-level tracking (tooling, samples, shipping, certs, materials)
- Variance alerts when over budget
- Export for accounting (QuickBooks, Xero, CSV)

#### Technical Implementation:

**Database Schema:**
```sql
CREATE TABLE project_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),

  -- Budget categories
  total_budget NUMERIC(12,2),

  categories JSONB DEFAULT '{
    "tooling": {"budgeted": 0, "spent": 0},
    "samples": {"budgeted": 0, "spent": 0},
    "certifications": {"budgeted": 0, "spent": 0},
    "shipping": {"budgeted": 0, "spent": 0},
    "materials": {"budgeted": 0, "spent": 0},
    "other": {"budgeted": 0, "spent": 0}
  }',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES auth.users(id),

  category TEXT, -- tooling, samples, certifications, shipping, materials, other
  description TEXT,
  amount NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',

  -- Invoice
  invoice_number TEXT,
  invoice_date DATE,
  invoice_url TEXT, -- PDF/image upload
  vendor_name TEXT,

  -- OCR extracted data
  ocr_data JSONB, -- Raw extracted data from invoice

  status TEXT DEFAULT 'pending', -- pending, approved, paid, rejected

  created_at TIMESTAMPTZ DEFAULT NOW(),
  payment_date DATE
);
```

**API Endpoints:**
```typescript
GET /api/projects/[id]/budget
  - Fetch budget overview with variance

POST /api/projects/[id]/expenses
  - Add expense (with invoice upload)

POST /api/expenses/[id]/ocr
  - Extract data from invoice image using OCR

GET /api/projects/[id]/burn-rate
  - Calculate spending rate and project runway

POST /api/projects/[id]/budget/export
  - Export to CSV/QuickBooks format
```

**Components:**
```typescript
components/budget/
  ├── BudgetDashboard.tsx            // Overview with charts
  ├── BudgetPlanner.tsx              // Set initial budget
  ├── ExpenseForm.tsx                // Add expense manually
  ├── InvoiceUploader.tsx            // Upload and OCR parse
  ├── VarianceChart.tsx              // Budget vs actual by category
  ├── BurnRateWidget.tsx             // Spending rate over time
  ├── CategoryBreakdown.tsx          // Pie/bar chart by category
  └── ExportButton.tsx               // Export for accounting
```

**User Flow:**
1. After project creation, system generates initial budget from AI estimates
2. User can adjust budget categories
3. As expenses occur, user uploads invoices
4. OCR extracts: Amount, date, vendor, description
5. User categorizes expense
6. Dashboard shows: "Tooling: $8,500 / $10,000 (85% used)"
7. Alert: "⚠️ Samples category is 20% over budget"
8. Burn rate: "At current rate, you'll exceed total budget in 45 days"
9. Export to QuickBooks for accounting

**OCR Integration:**
```typescript
// Use Tesseract.js or cloud OCR API
async function parseInvoice(imageUrl: string) {
  const ocrResult = await OCR.recognize(imageUrl);

  // Extract structured data
  const extracted = {
    invoice_number: extractPattern(ocrResult, /Invoice #:?\s*(\d+)/i),
    date: extractDate(ocrResult),
    total: extractAmount(ocrResult, /Total:?\s*\$?([\d,]+\.?\d*)/i),
    vendor: extractVendor(ocrResult)
  };

  return extracted;
}
```

---

## 📊 P2: Medium Priority Features

### 7. Advanced Search & Filtering

**Priority**: P2 - Medium
**What**: Global search across projects, manufacturers, RFQs with filters
**Effort**: Low-Medium (1-2 weeks)
**Impact**: Medium

---

### 8. Team Collaboration

**Priority**: P2 - Medium
**What**: Invite team members to projects with role permissions
**Effort**: Medium (2 weeks)
**Impact**: Medium-High

---

### 9. Manufacturer Performance Analytics

**Priority**: P2 - Medium
**What**: Track on-time delivery, quality scores, communication responsiveness
**Effort**: Medium (2-3 weeks)
**Impact**: Medium

---

### 10. White-Label Product Catalog

**Priority**: P2 - Medium
**What**: Searchable database of white-label products available for branding
**Effort**: High (3-4 weeks)
**Impact**: Medium-High

---

## 🛠️ Implementation Prompts for Google Antigravity IDE

### Prompt 1: Quote Comparison Dashboard

```
Build a manufacturer quote comparison feature for ManuPilot:

1. **Database**: Create rfq_responses table with fields:
   - rfq_id, manufacturer_id, user_id
   - raw_quote_text, quote_file_url
   - extracted_metrics (jsonb): unit_price, moq, lead_time, payment_terms
   - ai_analysis (jsonb): quality_score, red_flags, green_flags
   - negotiation_rounds (jsonb array)
   - status (received, under_review, accepted, rejected)

2. **API Routes**:
   - POST /api/rfq/[id]/responses/analyze - Upload quote, extract metrics with OpenAI
   - GET /api/rfq/[id]/comparison - Return all quotes with normalized scores
   - PATCH /api/rfq/[id]/responses/[responseId] - Track negotiations

3. **AI Integration**:
   - Use OpenAI to extract: price, MOQ, lead time, terms from unstructured quotes
   - Analyze for red flags (unrealistic pricing, vague terms)
   - Generate quality score (0-100)

4. **UI Components**:
   - QuoteComparisonMatrix.tsx: Sortable table with best-value highlighting
   - QuoteAnalysisPanel.tsx: AI insights sidebar
   - NegotiationTracker.tsx: Track price counter-offers
   - DecisionMatrix.tsx: Weighted criteria (user sets importance of price/quality/speed)

5. **Features**:
   - Auto-highlight best price, fastest lead time, lowest MOQ
   - Side-by-side comparison view
   - Export comparison as PDF
   - Set criteria weights (e.g., 40% price, 30% quality, 20% speed, 10% MOQ)

Tech stack: Next.js 16, TypeScript, Supabase, OpenAI API, Tailwind CSS
```

---

### Prompt 2: Sample Management System

```
Implement a comprehensive sample management system for ManuPilot:

1. **Database**: Create sample_requests table with:
   - project_id, manufacturer_id, user_id
   - version_number (1, 2, 3...)
   - status (requested, in_production, shipped, received, evaluating, approved, rejected)
   - checklist_items (jsonb array)
   - photos (jsonb array with annotation data)
   - feedback_data (jsonb mapped to BOM components)
   - ai_quality_analysis (jsonb)
   - decision (approved, revision_required, rejected)

2. **Photo Annotation**:
   - Build canvas-based photo annotation tool
   - Users can click on image to mark defects
   - Add comments: "Wall thickness too thin", "Color mismatch"
   - Save annotations as coordinates + text

3. **AI Quality Analysis**:
   - Use OpenAI Vision API to analyze uploaded photos
   - Compare against project specifications
   - Detect: surface finish issues, dimensional errors, color inconsistencies
   - Generate quality score and deviation report

4. **Components**:
   - SampleRequestWizard.tsx: Multi-step form to request sample
   - PhotoAnnotationTool.tsx: Canvas with click-to-annotate
   - SampleFeedbackForm.tsx: Structured feedback per BOM component
   - SampleComparisonView.tsx: Side-by-side V1 vs V2 comparison
   - SampleTimeline.tsx: Visual timeline of sample iterations

5. **Version Tracking**:
   - Track Sample V1 → V2 → V3 → Production
   - Show what changed between versions
   - Compare photos side-by-side

6. **Collaborative Review**:
   - Invite stakeholders to review samples
   - Each person can add their own annotations and feedback
   - Consolidated feedback report

Tech stack: Next.js 16, TypeScript, Supabase, OpenAI Vision API, HTML5 Canvas, Tailwind CSS
```

---

### Prompt 3: Real-Time Messaging with AI Assist

```
Build a real-time messaging system between users and manufacturers:

1. **Database** (enhance existing):
   - Add to messages table: attachments (jsonb), message_type (text/file/system)
   - Add translated_content (jsonb) for multi-language support
   - Create message_templates table for quick replies

2. **Real-Time**:
   - Use Supabase Realtime subscriptions for instant message delivery
   - Typing indicators ("Sarah is typing...")
   - Read receipts

3. **File Attachments**:
   - Allow upload of CAD files, PDFs, images
   - Store in Supabase Storage
   - Preview common file types in-line

4. **AI Features**:
   - Context-aware reply suggestions based on conversation history
   - Auto-translation for international manufacturers (detect language, translate)
   - Message templates: "Request sample", "Negotiate price", "Quality issue"

5. **Components**:
   - MessageThread.tsx: Real-time message list with Supabase subscription
   - MessageComposer.tsx: Rich text input + file attachments
   - AISuggestedReply.tsx: Show 3 AI-generated response options
   - TranslationToggle.tsx: Switch between original and translated
   - FileAttachmentCard.tsx: Preview attached files

6. **AI Prompt for Suggestions**:
   - Analyze conversation context (RFQ details, project specs, past messages)
   - Generate 3 contextually relevant reply options
   - Example: If discussing price, suggest negotiation tactics

Tech stack: Next.js 16, TypeScript, Supabase (Realtime + Storage), OpenAI API, Tailwind CSS
```

---

### Prompt 4: Project Timeline & Milestones

```
Create a visual project timeline and milestone tracker:

1. **Database**: Create project_milestones table:
   - project_id, phase_id, name, description
   - dependencies (uuid array)
   - on_critical_path (boolean)
   - planned_start_date, planned_end_date
   - actual_start_date, actual_end_date
   - status (not_started, in_progress, blocked, completed, delayed)
   - completion_evidence (jsonb with photos/docs)
   - days_variance (calculated field)

2. **Timeline Visualization**:
   - Use library like react-gantt-chart or build custom
   - Show milestones as bars on timeline
   - Highlight critical path in red
   - Show dependencies with connecting lines

3. **Variance Tracking**:
   - Calculate: days_variance = actual_end_date - planned_end_date
   - Show "3 days ahead" or "5 days delayed" badges
   - Alert when milestone is overdue

4. **Critical Path**:
   - Calculate longest path through dependencies
   - Highlight milestones on critical path
   - Show impact if critical milestone is delayed

5. **Components**:
   - GanttChart.tsx: Visual timeline (use react-gantt-chart library)
   - MilestoneCard.tsx: Individual milestone details
   - CriticalPathView.tsx: Highlight critical path
   - VarianceReport.tsx: Actual vs planned analysis
   - MilestoneCompletionModal.tsx: Upload proof (photos, certs, contracts)

6. **Notifications**:
   - Alert when milestone is overdue
   - Warn when critical path milestone is delayed
   - Notify when milestone completed

Tech stack: Next.js 16, TypeScript, Supabase, react-gantt-chart, Tailwind CSS
```

---

### Prompt 5: Compliance Document Generator

```
Build an automated compliance/certification document generator:

1. **Database**:
   - Create certification_applications table (id, project_id, certification_type, application_data, status, testing_lab_id, cost, deadline)
   - Create certification_templates table with pre-built templates for FCC, CE, UL, RoHS, etc.

2. **Template System**:
   - Store certification templates with required fields mapping
   - Auto-fill from project data: product name, specs, BOM, materials
   - Generate PDF applications using @react-pdf/renderer

3. **Auto-Fill Logic**:
   - Extract relevant data from project.ai_analysis and playbook_snapshot
   - Map to certification form fields
   - Example: FCC needs operating frequency → extract from specs

4. **Testing Lab Integration**:
   - Directory of testing labs by certification type and region
   - Get quotes from labs
   - Track testing costs and deadlines

5. **Components**:
   - CertificationWizard.tsx: Multi-step setup (select cert type, markets)
   - ApplicationGenerator.tsx: Preview and edit auto-filled application
   - CertificationChecklist.tsx: Step-by-step requirements
   - TestingLabDirectory.tsx: Browse labs, compare quotes
   - ComplianceTimeline.tsx: Track cert deadlines
   - DocumentRepository.tsx: Store all certs and test reports

6. **Document Generation**:
   - Use @react-pdf/renderer to create formatted PDF applications
   - Include all required sections for each certification type
   - Allow user to edit before downloading

Tech stack: Next.js 16, TypeScript, Supabase, @react-pdf/renderer, Tailwind CSS
```

---

### Prompt 6: Budget & Expense Tracking

```
Implement comprehensive cost tracking and budget management:

1. **Database**:
   - Create project_budgets table (total_budget, categories jsonb with tooling/samples/certs/shipping/materials)
   - Create expenses table (project_id, category, amount, invoice_url, vendor_name, status, payment_date)

2. **Invoice OCR**:
   - Upload invoice image/PDF
   - Use OCR (Tesseract.js or cloud OCR API) to extract: amount, date, vendor
   - User confirms/edits extracted data
   - Auto-categorize based on vendor or description

3. **Budget Variance**:
   - Calculate budget vs actual for each category
   - Show percentage used: "Tooling: $8,500 / $10,000 (85%)"
   - Alert when category exceeds budget

4. **Burn Rate**:
   - Calculate average spending per week
   - Project runway: "At current rate, budget will be exhausted in 45 days"
   - Chart spending over time

5. **Components**:
   - BudgetDashboard.tsx: Overview with charts (use recharts or chart.js)
   - BudgetPlanner.tsx: Set initial budget by category
   - ExpenseForm.tsx: Add expense manually
   - InvoiceUploader.tsx: Upload + OCR parsing
   - VarianceChart.tsx: Budget vs actual by category (bar chart)
   - BurnRateWidget.tsx: Line chart of spending over time

6. **Export**:
   - Export to CSV for accounting software
   - Format compatible with QuickBooks/Xero

Tech stack: Next.js 16, TypeScript, Supabase, Tesseract.js (OCR), recharts, Tailwind CSS
```

---

## 📈 Expected Impact Summary

| Feature | Development Effort | User Impact | Revenue Potential | Priority |
|---------|-------------------|-------------|-------------------|----------|
| Quote Comparison Dashboard | Medium (2-3 weeks) | Very High | High | P0 |
| Sample Management | Medium (2-3 weeks) | Very High | High | P0 |
| Real-Time Messaging | Medium (2 weeks) | High | Medium | P1 |
| Timeline & Milestones | Medium (2 weeks) | High | Medium | P1 |
| Compliance Generator | High (3-4 weeks) | High | Very High | P1 |
| Budget Tracking | Medium (2-3 weeks) | High | Medium | P1 |

---

## 🎯 Recommended Implementation Order

1. **Phase 1** (4-6 weeks):
   - Quote Comparison Dashboard (closes critical gap in RFQ workflow)
   - Sample Management (core manufacturing iteration)

2. **Phase 2** (4-6 weeks):
   - Timeline & Milestones (project management essential)
   - Real-Time Messaging (speed up negotiations)

3. **Phase 3** (6-8 weeks):
   - Compliance Document Generator (premium feature, high value)
   - Budget Tracking (financial visibility)

---

## 💡 Monetization Opportunities

### Premium Features (Subscription Tiers)

**Free Tier:**
- Basic playbook generation
- 1 active project
- Manual quote comparison
- Limited AI assistance

**Pro Tier ($49/month):**
- Unlimited projects
- AI quote analysis
- Sample management
- Timeline tracking
- Basic messaging

**Enterprise Tier ($199/month):**
- Team collaboration
- Compliance document generator
- Advanced budget tracking
- Priority AI assistance
- Dedicated account manager

---

**End of Feature Suggestions**
