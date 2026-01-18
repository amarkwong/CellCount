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

---

## Research Findings Summary

### Selected Stack
- **ML Model:** YOLOv8 via Ultralytics (fine-tuned from keremberke/yolov8s-blood-cell-detection)
- **Backend:** FastAPI + Python
- **Frontend:** TBD (React recommended)
- **Deployment:** Docker

### Key Resources
- **Pre-trained model:** https://huggingface.co/keremberke/yolov8s-blood-cell-detection
- **Reference repo:** https://github.com/incri/BloodCell-Detector-YOLO
- **FastAPI template:** https://github.com/Alex-Lekov/yolov8-fastapi
- **Datasets:** TXL-PBC (1,260 images), CBC Dataset (360 images)

### Data Status
- Public datasets available for initial training
- User has unlabeled images requiring annotation workflow

---

## Current Phase

**Phase 2: Planning** - Defining architecture and setting up labeling workflow

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
