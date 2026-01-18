# Blood Cell Labeling Guide

## Visual Identification Rules

Use these rules when labeling blood smear images for model training:

| Cell Type | Visual Characteristics |
|-----------|----------------------|
| **WBC** (White Blood Cell) | Big purple blocks |
| **RBC** (Red Blood Cell) | Brown/tan colored cells |
| **PLT** (Platelets) | Small purple dots |

## Labeling Workflow

### Recommended Tool: CVAT
- Free, open-source
- Native YOLOv8 export
- Built-in AI-assist for pre-labeling

### Setup Steps

1. **Install CVAT locally:**
   ```bash
   git clone https://github.com/cvat-ai/cvat
   cd cvat
   docker compose up -d
   ```
   Access at http://localhost:8080

2. **Create a project** with 3 labels:
   - `RBC` (Red Blood Cell)
   - `WBC` (White Blood Cell)
   - `Platelets`

3. **Upload your blood smear images**

4. **Draw bounding boxes** around each cell following the visual rules above

5. **Export** in "Ultralytics YOLO Detection 1.0" format

### Labeling Tips

- **RBC**: Draw tight boxes around brown cells. Most numerous in image.
- **WBC**: Larger purple structures. Less common (maybe 1-5 per image).
- **Platelets**: Very small purple dots. Draw small boxes around each.
- **Overlapping cells**: Draw separate boxes for each visible cell.
- **Partial cells at edges**: Include if >50% visible.

## Dataset Size Recommendations

| Quality Level | Images Needed | Expected Improvement |
|---------------|---------------|---------------------|
| Minimum | 50-100 | Noticeable improvement |
| Good | 200-300 | Significant accuracy gains |
| Best | 500+ | Production-ready accuracy |

## Fine-tuning Command

After exporting labeled data from CVAT:

```python
from ultralytics import YOLO

# Load pre-trained model
model = YOLO('keremberke/yolov8s-blood-cell-detection')

# Fine-tune on your data
model.train(
    data='path/to/your/data.yaml',
    epochs=50,
    imgsz=640,
    batch=16,
    patience=10,
    pretrained=True
)
```
