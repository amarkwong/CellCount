# CellCount Feature Requirements

## Core Features

### 1. Image Upload
- **Drag-and-drop zone** for uploading blood smear images
- **Clipboard paste support** (Ctrl+V / Cmd+V) for quick image input
- Supported formats: PNG, JPG, JPEG, TIFF, BMP

### 2. Image Storage
- S3-compatible object storage (not necessarily AWS)
  - Options: MinIO (self-hosted), Cloudflare R2, Backblaze B2
- **Auto-expiry: 1 day by default**
- Configurable retention period if needed

### 3. Cell Detection Results

After upload/paste, display:

| Metric | Description |
|--------|-------------|
| **RBC Count** | Number of red blood cells detected |
| **WBC Count** | Number of white blood cells detected |
| **Platelet Count** | Number of platelets detected (if applicable) |
| **Ratios** | RBC:WBC, RBC:Platelet, WBC:Platelet ratios |

### 4. Image Preview
- Display uploaded/pasted image with detection overlay
- Zoom and pan controls for detailed inspection

### 5. Cell Highlighting (Advanced)

Interactive checkboxes to toggle visibility of each cell type:

| Cell Type | Highlight Color | Checkbox Label |
|-----------|-----------------|----------------|
| RBC | Coral Red (#E07A5F) | "Red Blood Cells" |
| WBC | Ocean Blue (#3D5A80) | "White Blood Cells" |
| Platelets | Amber Yellow (#F2CC8F) | "Platelets" |

**Purpose:**
- Identify **overlapping detections** (cells counted 2-3 times)
- Spot **missing cells** (unhighlighted cells in the image)
- Allow users to verify AI accuracy

### 6. Detection Quality Indicators

- Visual indication when cells overlap (potential double-counting)
- Unhighlighted cells indicate potential missed detections
- Confidence scores per detection (optional display)

---

## User Flow

```
1. User drags/drops OR pastes image
         ↓
2. Image uploaded to temporary storage (1-day expiry)
         ↓
3. YOLOv8 model runs detection
         ↓
4. Results displayed:
   - Image preview with bounding boxes
   - Count summary (RBC, WBC, Platelets)
   - Ratios between cell types
         ↓
5. User toggles checkboxes to highlight cell types
         ↓
6. User reviews for overlaps/missing cells
         ↓
7. User exports results (optional)
```

---

## Technical Requirements

### Storage Options (S3-compatible with auto-expiry)

| Option | Self-hosted | Cost | Auto-expiry |
|--------|-------------|------|-------------|
| **MinIO** | Yes | Free | Lifecycle rules |
| **Cloudflare R2** | No | Free 10GB/mo | Lifecycle rules |
| **Backblaze B2** | No | Free 10GB/mo | Lifecycle rules |
| **Supabase Storage** | No | Free 1GB | Custom logic |

### Frontend Requirements
- React with TypeScript
- `react-dropzone` for drag-and-drop
- Clipboard API for paste support
- Canvas/SVG for cell highlighting overlay

### Backend Requirements
- FastAPI endpoint for image upload
- Pre-signed URLs for direct upload to storage
- Detection endpoint returns cell positions and classifications
