# Phase 2 Research: WBC Differential & Immature Cell Classification

## Key Papers to Review

### WBC Classification (General)
1. **A large dataset of white blood cells containing cell locations and types**
   - https://www.nature.com/articles/s41598-021-04426-x
   - Raabin-WBC dataset paper - describes 40k images with detailed labels

2. **Classification of white blood cells using deep features from CNN models**
   - https://www.sciencedirect.com/science/article/abs/pii/S1568494620307481
   - Compares ResNet, DenseNet, VGG for WBC classification

3. **White blood cells classification using multi-fold pre-processing and optimized CNN**
   - https://www.nature.com/articles/s41598-024-52880-0
   - 2024 paper achieving 99% accuracy with data augmentation

### Bone Marrow / Immature Cells (Myelocytes, Metamyelocytes)
4. **High-accuracy morphological identification of bone marrow cells using Morphogo**
   - https://www.nature.com/articles/s41598-023-40424-x
   - 25 cell categories including myelocytes/metamyelocytes
   - 2.8 million training images, 80%+ accuracy

5. **AIFORIA deep-learning algorithm for bone marrow classification**
   - https://pmc.ncbi.nlm.nih.gov/articles/PMC11954740/
   - 9 major hematopoietic cell classes
   - Notes difficulty distinguishing metamyelocytes from monocytes

6. **Automated bone marrow cytology using deep learning**
   - https://www.nature.com/articles/s43856-022-00107-6
   - Creates "Histogram of Cell Types" (HCT)
   - Dataset: 1.1M+ annotated cells

### YOLO-based Blood Cell Detection
7. **NBCDC-YOLOv8: Framework to improve blood cell detection**
   - https://ietresearch.onlinelibrary.wiley.com/doi/full/10.1049/cvi2.12341
   - 2025 paper, 94.7% mAP on BCCD dataset

---

## Datasets

### Primary: Raabin-WBC
- **Download:** https://raabindata.com/free-data/
- **Paper:** https://www.nature.com/articles/s41598-021-04426-x
- **Contents:**
  - ~40,000 WBC images
  - 5 main types: Neutrophil, Lymphocyte, Monocyte, Eosinophil, Basophil
  - Sub-labels: Metamyelocytes, Band neutrophils
  - Segmentation masks for 1,145 cells
- **Format:** Cropped cell images, multiple labeling schemes

### Primary: TCIA Bone Marrow Cytomorphology
- **Download:** https://wiki.cancerimagingarchive.net/pages/viewpage.action?pageId=101941770
- **Contents:**
  - 170,000+ expert-annotated cell images
  - 21 cell types including:
    - Myelocyte: 6,557 images
    - Metamyelocyte: 3,055 images
    - Promyelocyte: 11,994 images
  - From 945 patients
- **Format:** Single-cell images with expert labels

### Supplementary: Mendeley Promyelocyte/Myelocyte
- **Download:** https://data.mendeley.com/datasets/snkd93bnjr/1
- **Use:** Additional immature cell samples

### Supplementary: PBC Dataset (Curated)
- **Paper:** https://www.nature.com/articles/s41597-025-05980-z
- **Description:** Re-annotated, merged dataset from 4 public sources

---

## Key Technical Considerations

### Challenge: Immature Cell Morphology
Myelocytes and metamyelocytes have subtle morphological differences:
- **Myelocyte:** Round nucleus, visible cytoplasm, early granules
- **Metamyelocyte:** Kidney/bean-shaped nucleus, more granules
- **Band neutrophil:** U-shaped/band nucleus, mature granules

Models often confuse:
- Metamyelocytes ↔ Monocytes (similar kidney-shaped nucleus)
- Myelocytes ↔ Promyelocytes (both early-stage)

### Staining Considerations
- Raabin-WBC: Giemsa stain
- TCIA: May-Grünwald-Giemsa/Pappenheim
- Your images: Verify staining method for compatibility

### Training Recommendations
1. **Data augmentation:** Rotation, flip, color jitter (simulate staining variation)
2. **Class balancing:** Oversample rare cells (basophils, metamyelocytes)
3. **Multi-scale detection:** Cells vary in size across magnifications
4. **Confidence calibration:** Tune thresholds per class

---

## Next Steps

1. [ ] Register/download Raabin-WBC dataset
2. [ ] Register/download TCIA dataset (requires TCIA account)
3. [ ] Analyze your own blood smear images for staining compatibility
4. [ ] Define final class taxonomy (how many classes to train)
5. [ ] Prepare YOLO-format annotations
