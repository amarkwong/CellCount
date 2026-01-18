# CellCount UX Design Specification

**Version:** 1.0
**Date:** 2026-01-17
**Author:** UX Designer Agent

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Screen 1: Main Upload Screen](#screen-1-main-upload-screen)
5. [Screen 2: Results/Analysis Screen](#screen-2-resultsanalysis-screen)
6. [Cell Marker Design](#cell-marker-design)
7. [Export Panel](#export-panel)
8. [Interaction Patterns](#interaction-patterns)
9. [Accessibility Guidelines](#accessibility-guidelines)
10. [Responsive Considerations](#responsive-considerations)

---

## Design Philosophy

### Core Principles

1. **Clinical Precision** - The interface should feel like a professional medical tool, not a consumer app
2. **Minimal Cognitive Load** - Pathologists need to focus on the cells, not the interface
3. **High Information Density** - Show relevant data without clutter
4. **Confidence-Inspiring** - Professional aesthetics that convey reliability and accuracy

### Visual Language

- Clean, flat design with subtle shadows for depth
- Generous whitespace to reduce visual fatigue
- High contrast for critical information
- Muted backgrounds to make cell images the focal point

---

## Color Palette

### Primary Colors

| Name | Hex | Usage | RGB |
|------|-----|-------|-----|
| **Deep Navy** | `#1E3A5F` | Primary buttons, headers, key actions | rgb(30, 58, 95) |
| **Clinical White** | `#FAFBFC` | Background, cards | rgb(250, 251, 252) |
| **Slate Gray** | `#64748B` | Secondary text, borders | rgb(100, 116, 139) |

### Cell Type Colors (Color-Blind Friendly)

These colors are optimized for deuteranopia, protanopia, and tritanopia. They use both hue AND saturation/brightness differences to ensure distinguishability.

| Cell Type | Primary Color | Hex | Symbol | Pattern Alternative |
|-----------|---------------|-----|--------|---------------------|
| **RBC (Red Blood Cell)** | Coral Red | `#E07A5F` | Circle (O) | Solid stroke |
| **WBC (White Blood Cell)** | Ocean Blue | `#3D5A80` | Square | Dashed stroke |
| **Platelet** | Amber Yellow | `#F2CC8F` | Triangle | Dotted stroke |

### State Colors

| State | Hex | Usage |
|-------|-----|-------|
| **Success** | `#059669` | Confirmed detections, save success |
| **Warning** | `#D97706` | Low confidence detections |
| **Error** | `#DC2626` | Failed uploads, validation errors |
| **Selected/Active** | `#6366F1` | Currently selected marker |

### Neutral Scale

```
Gray 50:  #F8FAFC (lightest background)
Gray 100: #F1F5F9 (card backgrounds)
Gray 200: #E2E8F0 (borders)
Gray 300: #CBD5E1 (disabled states)
Gray 400: #94A3B8 (placeholder text)
Gray 500: #64748B (secondary text)
Gray 600: #475569 (body text)
Gray 700: #334155 (headings)
Gray 800: #1E293B (primary text)
Gray 900: #0F172A (darkest text)
```

---

## Typography

### Font Stack

**Primary Font:** Inter
- Clean, highly legible sans-serif
- Excellent for UI and data display
- Wide range of weights available
- Free and open-source

**Monospace Font:** JetBrains Mono
- For cell counts, measurements, numerical data
- Clear distinction between similar characters (0/O, 1/l)

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| **Page Title** | 28px (1.75rem) | 600 (Semi-bold) | 1.2 | -0.02em |
| **Section Header** | 20px (1.25rem) | 600 | 1.3 | -0.01em |
| **Card Title** | 16px (1rem) | 600 | 1.4 | 0 |
| **Body Text** | 14px (0.875rem) | 400 | 1.5 | 0 |
| **Small Text** | 12px (0.75rem) | 400 | 1.4 | 0.01em |
| **Caption** | 11px (0.6875rem) | 500 | 1.3 | 0.02em |
| **Cell Count (Large)** | 36px (2.25rem) | 700 (Bold) | 1.1 | -0.02em |
| **Cell Count (Small)** | 24px (1.5rem) | 600 | 1.2 | -0.01em |

### CSS Implementation

```css
/* Font imports */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Consolas', monospace;
}

body {
  font-family: var(--font-primary);
  font-size: 14px;
  line-height: 1.5;
  color: #1E293B;
  -webkit-font-smoothing: antialiased;
}
```

---

## Screen 1: Main Upload Screen

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ [Logo] CellCount           [History] [Settings] [Help] [User]  ││
│  └─────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                         MAIN CONTENT AREA                           │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                                                                 ││
│  │                    ┌───────────────────────┐                    ││
│  │                    │                       │                    ││
│  │                    │    [Upload Icon]      │                    ││
│  │                    │                       │                    ││
│  │                    │   Drop blood smear    │                    ││
│  │                    │   image here          │                    ││
│  │                    │                       │                    ││
│  │                    │   or                  │                    ││
│  │                    │                       │                    ││
│  │                    │   [Browse Files]      │                    ││
│  │                    │                       │                    ││
│  │                    │   PNG, JPG, TIFF      │                    ││
│  │                    │   Max 50MB            │                    ││
│  │                    │                       │                    ││
│  │                    └───────────────────────┘                    ││
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  QUICK START GUIDE                                              ││
│  │  1. Upload a blood smear image                                  ││
│  │  2. AI will automatically detect and count cells                ││
│  │  3. Review and correct any detection errors                     ││
│  │  4. Export your results                                         ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  RECENT ANALYSES                                 [View All →]   ││
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                           ││
│  │  │ thumb   │ │ thumb   │ │ thumb   │                           ││
│  │  │ Jan 16  │ │ Jan 15  │ │ Jan 14  │                           ││
│  │  │ 4.2M RBC│ │ 3.8M RBC│ │ 4.1M RBC│                           ││
│  │  └─────────┘ └─────────┘ └─────────┘                           ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Upload Zone Specifications

**Default State:**
- Dashed border: 2px, `#CBD5E1`, border-radius: 12px
- Background: `#F8FAFC`
- Icon: Cloud upload outline, 64px, `#64748B`
- Minimum height: 320px

**Hover/Drag-Over State:**
- Border: 2px solid `#6366F1`
- Background: `#EEF2FF` (light indigo)
- Icon color changes to `#6366F1`
- Subtle scale transform: 1.01

**Uploading State:**
- Progress bar replaces instructions
- Thumbnail preview appears (if possible)
- Cancel button available

### Instructions Panel

**Content:**
```
Quick Start Guide

1. Upload a blood smear image
   Supported formats: PNG, JPG, JPEG, TIFF (max 50MB)

2. Automatic Detection
   Our AI (YOLOv8) will identify and mark RBCs, WBCs, and Platelets

3. Review & Correct
   Click markers to select, drag to reposition, or add/remove as needed

4. Export Results
   Download count summary (CSV/PDF) or annotated image
```

### Loading State During Detection

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                    ┌───────────────────────┐                        │
│                    │                       │                        │
│                    │   [Image Thumbnail]   │                        │
│                    │                       │                        │
│                    └───────────────────────┘                        │
│                                                                     │
│                    ████████████░░░░░░░░░░░░  67%                    │
│                                                                     │
│                    Analyzing blood smear...                         │
│                    Detecting cell boundaries                        │
│                                                                     │
│                    ┌─────────────────────────────┐                  │
│                    │ Cells detected so far:      │                  │
│                    │ ○ RBC: 4,231                │                  │
│                    │ □ WBC: 12                   │                  │
│                    │ △ Platelets: 847           │                  │
│                    └─────────────────────────────┘                  │
│                                                                     │
│                    [Cancel Analysis]                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Loading Animation:**
- Circular spinner OR horizontal progress bar
- Real-time count updates as detection progresses
- Estimated time remaining (if calculable)
- Cancel option always visible

---

## Screen 2: Results/Analysis Screen

### Layout Structure (Desktop)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ [← Back] sample_001.jpg                    [Save] [Export ▼] [Help]     ││
│  └──────────────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────┐ ┌───────────────────┐│
│  │                                                   │ │  CELL COUNTS      ││
│  │                                                   │ │                   ││
│  │                                                   │ │  ○ RBC           ││
│  │                                                   │ │  4,231           ││
│  │                                                   │ │  ──────────────  ││
│  │                                                   │ │                   ││
│  │                  IMAGE CANVAS                     │ │  □ WBC           ││
│  │              (with cell markers)                  │ │  12              ││
│  │                                                   │ │  ──────────────  ││
│  │                                                   │ │                   ││
│  │                                                   │ │  △ Platelets    ││
│  │                                                   │ │  847             ││
│  │                                                   │ │                   ││
│  │                                                   │ │  ──────────────  ││
│  │                                                   │ │  TOTAL: 5,090    ││
│  ├───────────────────────────────────────────────────┤ │                   ││
│  │ [−][Reset][+]  Zoom: 100%   [Fit] [1:1]          │ ├───────────────────┤│
│  └───────────────────────────────────────────────────┘ │  TOOLS            ││
│                                                        │                   ││
│  ┌───────────────────────────────────────────────────┐ │  [Pan]  ← active ││
│  │  LEGEND / VISIBILITY                              │ │  [Select]        ││
│  │  ☑ ○ RBC (4,231)    ☑ Show confidence < 70%     │ │  [Add RBC]       ││
│  │  ☑ □ WBC (12)                                    │ │  [Add WBC]       ││
│  │  ☑ △ Platelets (847)                            │ │  [Add Platelet]  ││
│  └───────────────────────────────────────────────────┘ │  [Delete]        ││
│                                                        │                   ││
│                                                        └───────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

### Image Canvas Area

**Specifications:**
- Takes ~70% of available width on desktop
- Black or dark gray (`#1E293B`) background to contrast with blood smear
- Smooth pan and zoom (mouse wheel, pinch gesture)
- Double-click to zoom in at point
- Keyboard shortcuts: +/- for zoom, arrow keys for pan

**Zoom Controls:**
- Zoom slider or +/- buttons
- Preset buttons: "Fit to window", "100% (1:1)"
- Current zoom percentage displayed
- Zoom range: 10% to 400%

### Cell Count Panel

**Location:** Right sidebar, fixed position

**Design:**
```
┌─────────────────────────────────────┐
│  CELL COUNTS                        │
│  ═══════════════════════════════════│
│                                     │
│  ○ Red Blood Cells (RBC)            │
│  ┌─────────────────────────────────┐│
│  │         4,231                   ││  ← Large monospace number
│  │         ▼ 3 removed             ││  ← Change indicator
│  └─────────────────────────────────┘│
│                                     │
│  □ White Blood Cells (WBC)          │
│  ┌─────────────────────────────────┐│
│  │           12                    ││
│  │         ▲ 1 added               ││
│  └─────────────────────────────────┘│
│                                     │
│  △ Platelets (PLT)                 │
│  ┌─────────────────────────────────┐│
│  │          847                    ││
│  │         (no changes)            ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│  TOTAL CELLS: 5,090                 │
│                                     │
│  ═══════════════════════════════════│
│  Analysis Confidence: 94.2%         │
│  Low confidence: 23 cells           │
│  [Review Low Confidence →]          │
│                                     │
└─────────────────────────────────────┘
```

### Correction Tools Panel

**Tool Descriptions:**

1. **Pan Tool (Hand)** - Default. Click and drag to move around image
2. **Select Tool (Arrow)** - Click markers to select, Shift+click for multi-select
3. **Add RBC Tool** - Click on image to place new RBC marker
4. **Add WBC Tool** - Click on image to place new WBC marker
5. **Add Platelet Tool** - Click on image to place new platelet marker
6. **Delete Tool** - Click markers to remove them

**Selected Marker Actions:**
- Delete key: Remove selected marker(s)
- Drag: Reposition marker
- Right-click context menu: Change cell type, Delete, View confidence

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Pan | Space + drag, or Arrow keys |
| Zoom in | + or Scroll up |
| Zoom out | - or Scroll down |
| Select tool | V |
| Pan tool | H |
| Add RBC | R |
| Add WBC | W |
| Add Platelet | P |
| Delete selected | Delete or Backspace |
| Select all | Cmd/Ctrl + A |
| Deselect | Escape |
| Undo | Cmd/Ctrl + Z |
| Redo | Cmd/Ctrl + Shift + Z |
| Save | Cmd/Ctrl + S |

---

## Cell Marker Design

### Marker Shapes by Cell Type

**RBC (Red Blood Cell):**
```
    ┌───────┐
    │   ○   │   Circle outline
    │       │   Stroke: 2px
    └───────┘   Color: #E07A5F (Coral)
```
- Shape: Circle (reflects actual RBC shape)
- Size: Proportional to detected cell (typically 16-24px diameter at 100% zoom)
- Stroke width: 2px at 100%, scales with zoom
- Fill: Transparent or 10% opacity fill

**WBC (White Blood Cell):**
```
    ┌───────┐
    │   □   │   Square outline
    │       │   Stroke: 2px dashed
    └───────┘   Color: #3D5A80 (Ocean Blue)
```
- Shape: Rounded square (differentiates from RBC)
- Size: Typically larger than RBC markers (24-40px)
- Stroke: 2px dashed line
- Fill: Transparent or 10% opacity fill

**Platelet:**
```
    ┌───────┐
    │   △   │   Triangle outline
    │       │   Stroke: 2px dotted
    └───────┘   Color: #F2CC8F (Amber)
```
- Shape: Triangle pointing up (smallest cells, distinct shape)
- Size: Smaller than RBC (8-16px)
- Stroke: 2px dotted line
- Fill: Transparent or 15% opacity fill

### Marker States

**Default (Unselected):**
- Standard stroke color for cell type
- Stroke width: 2px
- No fill or very subtle fill (10% opacity)

**Hover:**
- Stroke width increases to 3px
- Subtle glow effect (box-shadow: 0 0 8px [color])
- Cursor changes to pointer

**Selected:**
- Fill: 25% opacity of cell color
- Stroke color changes to `#6366F1` (Indigo)
- Stroke width: 3px
- Small resize handles appear at cardinal points
- Selection indicator ring outside marker

**Low Confidence (< 70%):**
- Stroke style: Animated dashed (marching ants)
- Warning indicator: Small yellow dot in corner
- Tooltip shows confidence percentage

**Multi-Select:**
- All selected markers show selection state
- Bounding box around selection group

### Visual Example

```
Normal RBC:          Selected RBC:        Low Confidence RBC:
    ╭───╮               ╭───╮                  ╭ ─ ─ ╮
    │ ○ │               │ ● │ ←selected fill   │ ○ ⚠ │ ←warning
    ╰───╯               ╰───╯                  ╰ ─ ─ ╯
                           ↑                       ↑
                       selection ring         dashed stroke
```

### Interaction: Adding Markers

1. Select appropriate "Add [Cell Type]" tool
2. Click on image where cell should be marked
3. New marker appears at click point with default size
4. Drag edges to adjust size if needed
5. Marker auto-saves (or requires explicit save)

### Interaction: Removing Markers

**Method 1: Delete Tool**
1. Select Delete tool
2. Click on marker to remove

**Method 2: Selection + Delete**
1. Use Select tool to click marker(s)
2. Press Delete/Backspace key

**Method 3: Context Menu**
1. Right-click on marker
2. Select "Delete" from menu

### Interaction: Changing Cell Type

1. Right-click on marker
2. Select "Change Type" → Choose new type
3. Marker shape and color update immediately

---

## Export Panel

### Export Modal Design

```
┌─────────────────────────────────────────────────────────────────────┐
│  Export Analysis Results                                    [×]     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  FILE NAME                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ blood_smear_001_analysis                                        ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ═══════════════════════════════════════════════════════════════════│
│  EXPORT FORMATS                                                     │
│  ═══════════════════════════════════════════════════════════════════│
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ ☑ Summary Report (PDF)                                        │  │
│  │   Professional report with counts, statistics, and thumbnail  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ ☑ Count Data (CSV)                                            │  │
│  │   Raw cell counts and positions for further analysis          │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ ☑ Annotated Image (PNG)                                       │  │
│  │   Original image with cell markers overlay                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ ☐ Raw Detection Data (JSON)                                   │  │
│  │   Full detection data including confidence scores             │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ═══════════════════════════════════════════════════════════════════│
│  IMAGE OPTIONS (for annotated image)                                │
│  ═══════════════════════════════════════════════════════════════════│
│                                                                     │
│  Include in annotated image:                                        │
│  ☑ RBC markers     ☑ WBC markers     ☑ Platelet markers            │
│  ☑ Count legend    ☐ Confidence indicators                         │
│                                                                     │
│  Resolution: ○ Original  ● High (300 DPI)  ○ Standard (150 DPI)    │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│                              [Cancel]    [Export Selected]          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Export Format Details

#### PDF Report Contents

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  CELLCOUNT ANALYSIS REPORT                                          │
│  ═══════════════════════════════════════════════════════════════════│
│                                                                     │
│  Sample: blood_smear_001.jpg                                        │
│  Date: January 17, 2026                                             │
│  Analyzed by: CellCount v1.0 (YOLOv8)                              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                     [Thumbnail Image]                           ││
│  │                     with markers                                ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  CELL COUNTS                                                        │
│  ─────────────────────────────────────────────────────────────────  │
│  │ Cell Type       │ Count    │ Percentage │ Manual Edits │        │
│  ├─────────────────┼──────────┼────────────┼──────────────│        │
│  │ RBC             │ 4,231    │ 83.1%      │ -3           │        │
│  │ WBC             │ 12       │ 0.2%       │ +1           │        │
│  │ Platelets       │ 847      │ 16.6%      │ 0            │        │
│  ├─────────────────┼──────────┼────────────┼──────────────│        │
│  │ TOTAL           │ 5,090    │ 100%       │              │        │
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ANALYSIS NOTES                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  • Overall confidence: 94.2%                                        │
│  • 23 cells flagged as low confidence (reviewed)                    │
│  • Manual corrections: 4 total                                      │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  Generated by CellCount | www.cellcount.app                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### CSV Data Structure

```csv
# CellCount Export - blood_smear_001
# Generated: 2026-01-17T14:32:00Z
# Model: YOLOv8-blood-cell-detection

id,cell_type,x_center,y_center,width,height,confidence,manual_edit
1,RBC,234,156,18,18,0.94,false
2,RBC,267,189,20,19,0.91,false
3,WBC,512,423,36,38,0.97,false
4,WBC,156,289,32,34,0.72,true
5,Platelet,789,234,10,9,0.88,false
...

# Summary
# RBC: 4231
# WBC: 12
# Platelet: 847
# Total: 5090
```

#### JSON Export Structure

```json
{
  "metadata": {
    "filename": "blood_smear_001.jpg",
    "analyzed_at": "2026-01-17T14:32:00Z",
    "model_version": "yolov8s-blood-cell-detection",
    "image_dimensions": {
      "width": 2048,
      "height": 1536
    }
  },
  "summary": {
    "total_cells": 5090,
    "rbc_count": 4231,
    "wbc_count": 12,
    "platelet_count": 847,
    "average_confidence": 0.942,
    "manual_edits": 4
  },
  "detections": [
    {
      "id": 1,
      "cell_type": "RBC",
      "bounding_box": {
        "x": 225,
        "y": 147,
        "width": 18,
        "height": 18
      },
      "center": { "x": 234, "y": 156 },
      "confidence": 0.94,
      "manual_edit": false
    }
  ]
}
```

---

## Interaction Patterns

### Drag and Drop Upload

1. User drags file over upload zone
2. Zone highlights with border color change
3. User drops file
4. Upload progress shows
5. Automatic redirect to analysis screen

### Undo/Redo System

- Track all marker changes (add, remove, move, type change)
- Unlimited undo stack (session-based)
- Visual feedback on undo/redo (brief flash on affected marker)

### Autosave

- Changes auto-save every 30 seconds
- Visual indicator: "Saved" with timestamp
- Unsaved changes indicator: Small dot on Save button

### Error States

**Upload Errors:**
- Invalid file type: "Please upload a PNG, JPG, or TIFF image"
- File too large: "File exceeds 50MB limit. Please compress or crop the image"
- Upload failed: "Upload failed. Please check your connection and try again"

**Detection Errors:**
- Model timeout: "Analysis is taking longer than expected. [Continue Waiting] [Cancel]"
- Model failure: "Unable to analyze image. The image may be too dark or blurry. [Try Again] [Upload Different Image]"

---

## Accessibility Guidelines

### Color Blindness Considerations

1. **Never rely on color alone** - All cell types have distinct shapes (circle, square, triangle)
2. **Text labels available** - Legend always shows text labels alongside colors
3. **Pattern alternatives** - Markers use different stroke styles (solid, dashed, dotted)
4. **High contrast mode** - Optional setting to increase contrast

### WCAG 2.1 AA Compliance

- Minimum contrast ratio 4.5:1 for normal text
- Minimum contrast ratio 3:1 for large text and UI components
- All interactive elements keyboard accessible
- Focus indicators clearly visible
- Screen reader compatible labels

### Keyboard Navigation

- Full keyboard navigation support
- Logical tab order
- Skip links for main content areas
- Keyboard shortcuts for common actions

### Screen Reader Support

- Semantic HTML structure
- ARIA labels for custom components
- Live regions for dynamic count updates
- Image alt text: "Blood smear image with [X] cells detected"

---

## Responsive Considerations

### Desktop (>1200px)

- Full three-column layout (tools, canvas, counts)
- All panels visible simultaneously
- Keyboard shortcuts enabled

### Tablet (768px - 1200px)

- Two-column layout
- Collapsible tools panel
- Counts panel below canvas or collapsible sidebar

### Mobile (<768px)

- Single column layout
- Bottom sheet for counts
- Floating action button for tools
- Pinch-to-zoom on canvas
- Simplified marker interactions

### Touch Considerations

- Minimum touch target: 44x44px
- Long-press for context menu (replaces right-click)
- Two-finger pan, pinch zoom
- Larger markers on touch devices

---

## Component Reference

### Button Styles

**Primary Button:**
```css
.btn-primary {
  background-color: #1E3A5F;
  color: #FFFFFF;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
}
.btn-primary:hover {
  background-color: #2D4A6F;
}
```

**Secondary Button:**
```css
.btn-secondary {
  background-color: #FFFFFF;
  color: #1E3A5F;
  border: 1px solid #CBD5E1;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
}
```

### Card Component

```css
.card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

### Form Inputs

```css
.input {
  border: 1px solid #CBD5E1;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 14px;
  width: 100%;
}
.input:focus {
  outline: none;
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
```

---

## Implementation Notes for Developers

### Recommended Libraries

- **Canvas/Image Manipulation:** Fabric.js or Konva.js for marker rendering
- **Zoom/Pan:** react-zoom-pan-pinch or panzoom
- **PDF Generation:** jsPDF or react-pdf
- **CSV Export:** papaparse
- **Icons:** Lucide React or Heroicons

### Performance Considerations

1. Use canvas rendering for markers (DOM elements won't scale for thousands of cells)
2. Implement marker clustering at low zoom levels
3. Lazy load marker data for very large images
4. Use WebWorkers for export generation
5. Debounce autosave to prevent excessive API calls

### State Management

Track the following state:
- Image data (URL, dimensions)
- All markers (array with position, type, confidence, manual flag)
- Edit history (for undo/redo)
- UI state (current tool, zoom level, pan position, selected markers)
- Unsaved changes flag

---

## Appendix: Color Blindness Simulation

The chosen cell type colors have been evaluated for various types of color blindness:

| Vision Type | RBC (#E07A5F) | WBC (#3D5A80) | Platelet (#F2CC8F) | Distinguishable? |
|-------------|---------------|---------------|---------------------|------------------|
| Normal | Coral | Blue | Amber | Yes |
| Deuteranopia | Brown | Blue | Yellow | Yes |
| Protanopia | Brown | Blue | Yellow | Yes |
| Tritanopia | Pink | Cyan | Pink | Marginal* |

*For tritanopia, the shape difference (circle vs triangle) provides additional differentiation.

---

*End of UX Design Specification*
