# CellCount Agent Workflow

## Project Context

**Goal:** Build an AI-assisted web application for counting red blood cells (RBCs) and white blood cells (WBCs) in blood smear images.

**Approach:** AI-assisted detection with potential model calibration using custom image data.

---

## Agent Roles

### 1. Team Leader
**Responsibilities:**
- Coordinate work between agents
- Make architectural and strategic decisions
- Escalate to the user when decisions require their input
- Prioritize tasks and resolve conflicts between agent recommendations

**Escalation Triggers:**
- Budget/cost decisions
- Technology stack choices with significant trade-offs
- Timeline-impacting decisions
- Data privacy/security concerns
- Feature scope changes

---

### 2. Researcher
**Responsibilities:**
- Literature review on blood cell counting methodologies
- Find existing open-source repositories for cell detection/counting
- Evaluate pre-trained models (YOLO, U-Net, CellPose, etc.)
- Assess build vs. buy vs. fine-tune decisions
- Research labeling tools for creating training datasets

**Key Questions to Answer:**
- What open-source solutions exist for blood cell counting?
- Which pre-trained models work well for blood smear analysis?
- What's required to fine-tune models with custom data?
- What datasets are publicly available for training/validation?

---

### 3. Full Stack Developer
**Responsibilities:**
- Implement the web application frontend and backend
- Integrate ML models for cell detection
- Build image upload and processing pipeline
- Implement cell count visualization and editing interface
- Create API endpoints for model inference

**Tech Considerations:**
- Frontend framework selection
- Backend/API architecture
- Model serving strategy (serverless vs. dedicated)
- Image processing pipeline

---

### 4. UX Designer
**Responsibilities:**
- Design intuitive interface for pathologists
- Ensure clear visual hierarchy and typography
- Design cell marking/annotation interface
- Create accessible color schemes (consider color blindness)
- Design mobile-responsive layouts if needed

**Key Deliverables:**
- Wireframes for core workflows
- Color palette and typography guidelines
- Annotation UI patterns
- Results display design

---

### 5. DevOps Engineer
**Responsibilities:**
- Recommend hosting platform (cost-effective/free tier options)
- Set up CI/CD pipeline
- Configure infrastructure as code (Terraform, Pulumi, etc.)
- Manage model deployment infrastructure
- Set up monitoring and logging

**Considerations:**
- GPU requirements for model inference
- Cold start times for serverless options
- Storage for uploaded images
- Cost optimization

---

### 6. QE (Quality Engineer)
**Responsibilities:**
- Define test strategy (unit, integration, e2e)
- Build automated test suites
- Create test cases for model accuracy validation
- Performance testing for image processing
- Accessibility testing

**Test Categories:**
- Image upload/processing flows
- Cell detection accuracy
- Manual correction workflows
- API reliability
- Cross-browser compatibility

---

## Workflow Process

```
┌─────────────────────────────────────────────────────────────────┐
│                        PHASE 1: RESEARCH                        │
├─────────────────────────────────────────────────────────────────┤
│  Researcher → Team Leader → User (for key decisions)            │
│  - Find open-source solutions                                   │
│  - Evaluate ML models                                           │
│  - Recommend starting point                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PHASE 2: PLANNING                          │
├─────────────────────────────────────────────────────────────────┤
│  Team Leader + All Agents                                       │
│  - Define architecture                                          │
│  - Choose tech stack                                            │
│  - Plan sprints/milestones                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 3: DEVELOPMENT                         │
├─────────────────────────────────────────────────────────────────┤
│  Full Stack + UX + DevOps (parallel work)                       │
│  - Build UI components                                          │
│  - Integrate ML model                                           │
│  - Set up infrastructure                                        │
│  QE: Write tests alongside development                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   PHASE 4: CALIBRATION                          │
├─────────────────────────────────────────────────────────────────┤
│  Researcher + Full Stack                                        │
│  - Fine-tune model with custom data                             │
│  - Validate accuracy                                            │
│  - Iterate on model performance                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     PHASE 5: DEPLOYMENT                         │
├─────────────────────────────────────────────────────────────────┤
│  DevOps + QE                                                    │
│  - Deploy to production                                         │
│  - Run final test suite                                         │
│  - Monitor and iterate                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## How to Invoke Agents

When working with Claude Code, invoke specific agents by requesting their expertise:

```
"As the Researcher agent, find open-source blood cell counting solutions"
"As the Team Leader, evaluate these options and recommend next steps"
"As the Full Stack Developer, implement the image upload component"
```

Or run multiple agents for comprehensive analysis:

```
"Have the Researcher find ML models, then have Team Leader make a recommendation"
```

---

## Decision Log

| Date | Decision | Made By | Rationale |
|------|----------|---------|-----------|
| 2026-01-17 | Use YOLOv8 fine-tuning approach | User + Team Leader | Best balance of accuracy (91.7% baseline → 95%+) and development speed |
| 2026-01-17 | Pre-trained model: keremberke/yolov8s-blood-cell-detection | Researcher | Highest accuracy available on Hugging Face, active maintenance |
| 2026-01-17 | Need labeling workflow for custom images | User | Has unlabeled blood smear images from lab |
| 2026-01-26 | Pivot to WBC differential classification | User | RBC counting less valuable (analyzers do this); WBC subtypes are differentiator |
| 2026-01-26 | Phase 1: Switch to Ruben-F/bloodcelldiff model | User + Researcher | Immediate 5 WBC subtype classification (neutrophil, lymphocyte, monocyte, eosinophil, basophil) |
| 2026-01-26 | Phase 2: Fine-tune for immature cells | User + Researcher | Add myelocyte, metamyelocyte, band neutrophil using Raabin-WBC + TCIA datasets |
| 2026-01-26 | Deprioritize reticulocyte/hemoglobin detection | User | Lower priority; focus on WBC differential first |

---

## Research Findings Summary

### Selected Stack
- **ML Model (Phase 1):** YOLOv8 via Ruben-F/bloodcelldiff (5 WBC subtypes)
- **ML Model (Phase 2):** Custom fine-tuned YOLOv8 with immature cell classes
- **Backend:** FastAPI + Python
- **Frontend:** React 18 + TypeScript
- **Deployment:** Docker

### Key Resources
- **Phase 1 Model:** https://huggingface.co/Ruben-F/bloodcelldiff
- **Legacy Model:** https://huggingface.co/keremberke/yolov8s-blood-cell-detection
- **Reference repo:** https://github.com/incri/BloodCell-Detector-YOLO
- **FastAPI template:** https://github.com/Alex-Lekov/yolov8-fastapi

### Datasets for Phase 2 Training
| Dataset | Images | Key Classes | URL |
|---------|--------|-------------|-----|
| Raabin-WBC | ~40,000 | 5 WBC types + metamyelocyte, band | https://raabindata.com/free-data/ |
| BM Cytomorphology (TCIA) | 170,000+ | Myelocyte (6.5k), Metamyelocyte (3k) | https://wiki.cancerimagingarchive.net/pages/viewpage.action?pageId=101941770 |
| PBC Dataset | Merged | Curated re-annotated cells | https://www.nature.com/articles/s41597-025-05980-z |

### WBC Classification Target Classes
**Phase 1 (immediate):** Neutrophil, Lymphocyte, Monocyte, Eosinophil, Basophil
**Phase 2 (fine-tuning):** + Myelocyte, Metamyelocyte, Band neutrophil

### Data Status
- Phase 1: Use pre-trained bloodcelldiff model
- Phase 2: Combine public datasets for immature cell training
- User images: Available for validation/fine-tuning

---

## Current Phase

**Phase 1: WBC Differential Implementation** - ✅ COMPLETE

### Completed Tasks
1. ✅ Backend model swap to Ruben-F/bloodcelldiff
2. ✅ Detection service updated for 7 cell types
3. ✅ Schema updated with 5 WBC subtypes
4. ✅ Frontend TypeScript types updated
5. ✅ CellCountPanel with WBC differential display
6. ✅ CellTypeToggle with grouped WBC subtypes
7. ✅ ImagePreview with subtype-specific colors
8. ✅ App.tsx state management updated

### Validation Complete (2026-01-27)
- [x] Model downloads from Hugging Face: `Ruben-F/bloodcelldiff`
- [x] Backend API returns 7 cell types: RBC, Platelets, Neutrophil, Lymphocyte, Monocyte, Eosinophil, Basophil
- [x] Cell type mapping fixed for abbreviated labels (PLT, NEUT, LYMPH, MONO, EOS, BASO)
- [x] Frontend serves and displays WBC differential

---

## Phase 2: Custom Model Training

**Goal:** Fine-tune YOLOv8 to accurately detect WBC subtypes including immature cells (myelocyte, metamyelocyte)

### Target Cell Classes (Extended)
| Class | Category | Source Dataset |
|-------|----------|----------------|
| Neutrophil | Mature WBC | Raabin-WBC |
| Lymphocyte | Mature WBC | Raabin-WBC |
| Monocyte | Mature WBC | Raabin-WBC |
| Eosinophil | Mature WBC | Raabin-WBC |
| Basophil | Mature WBC | Raabin-WBC |
| **Myelocyte** | Immature WBC | TCIA Bone Marrow |
| **Metamyelocyte** | Immature WBC | TCIA Bone Marrow, Raabin-WBC |
| Band Neutrophil | Immature WBC | Raabin-WBC |
| RBC | Red Blood Cell | Both |
| Platelets | Thrombocyte | Both |

### Datasets to Acquire

**1. Raabin-WBC Dataset**
- URL: https://raabindata.com/free-data/
- Size: ~40,000 images
- Contains: 5 WBC types + metamyelocytes + band cells
- Format: Cropped cell images with labels

**2. TCIA Bone Marrow Cytomorphology**
- URL: https://wiki.cancerimagingarchive.net/pages/viewpage.action?pageId=101941770
- Size: 170,000+ cell images
- Contains: Myelocyte (6.5k), Metamyelocyte (3k), Promyelocyte (12k)
- Format: Expert-annotated cell images

### Phase 2 Tasks
- [ ] Download and evaluate Raabin-WBC dataset
- [ ] Download and evaluate TCIA Bone Marrow dataset
- [ ] Convert datasets to YOLO format (if needed)
- [ ] Combine and balance dataset classes
- [ ] Set up training environment
- [ ] Fine-tune YOLOv8 model
- [ ] Validate on holdout test set
- [ ] Integrate new model into backend

### Training Strategy
1. Start with `yolov8s.pt` (small) or `yolov8m.pt` (medium) base
2. Transfer learning from existing blood cell weights
3. Target: 80%+ mAP on extended cell classes

---

## Project Deliverables

### Documentation
- **UX Design Specification:** `/docs/UX_DESIGN_SPEC.md` - Wireframes, color palette, typography, interactions
- **Feature Requirements:** `/docs/FEATURES.md` - User-defined feature specifications

### Backend (Created)
- `/backend/` - FastAPI application structure
  - `app/main.py` - Application entry point with lifespan management
  - `app/api/routes.py` - API endpoints
  - `app/core/model.py` - YOLOv8 model manager
  - `app/services/detection.py` - Detection service
  - `app/schemas/detection.py` - Pydantic schemas
  - `requirements.txt` - Python dependencies

### Research Findings
- **Labeling Tool:** CVAT recommended (free, YOLO export, AI-assist)
- **Hosting:** Hugging Face Spaces (free) + Cloudflare Pages (free) for MVP
