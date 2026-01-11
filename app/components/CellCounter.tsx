'use client'

import { useState, useRef } from 'react'

interface Marker {
  x: number
  y: number
  id: number
}

export default function CellCounter() {
  const [image, setImage] = useState<string | null>(null)
  const [markers, setMarkers] = useState<Marker[]>([])
  const [count, setCount] = useState(0)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
        setMarkers([])
        setCount(0)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newMarker: Marker = {
      x,
      y,
      id: Date.now()
    }

    setMarkers([...markers, newMarker])
    setCount(count + 1)
  }

  const handleMarkerClick = (e: React.MouseEvent, markerId: number) => {
    e.stopPropagation()
    setMarkers(markers.filter(marker => marker.id !== markerId))
    setCount(count - 1)
  }

  const incrementCount = () => {
    setCount(count + 1)
  }

  const decrementCount = () => {
    if (count > 0) {
      setCount(count - 1)
    }
  }

  const resetCount = () => {
    setCount(0)
    setMarkers([])
  }

  const clearImage = () => {
    setImage(null)
    setMarkers([])
    setCount(0)
  }

  return (
    <div className="cell-counter">
      {!image ? (
        <>
          <div className="upload-section">
            <label htmlFor="image-upload" className="upload-label">
              <div className="upload-button">
                📁 Choose Medical Image
              </div>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <p className="upload-info">
              Upload a medical image to start counting cells
            </p>
          </div>

          <div className="instructions">
            <h3>How to use:</h3>
            <ul>
              <li>Upload a medical image of cells</li>
              <li>Click on each cell to mark and count it</li>
              <li>Click on markers to remove them</li>
              <li>Use the manual counter buttons if needed</li>
              <li>Reset to start over with the same image</li>
            </ul>
          </div>
        </>
      ) : (
        <>
          <div className="counter-section">
            <h2>Cell Count</h2>
            <div className="counter-display">{count}</div>
            <div className="counter-controls">
              <button
                className="button button-primary"
                onClick={incrementCount}
              >
                + Add
              </button>
              <button
                className="button button-secondary"
                onClick={decrementCount}
              >
                - Subtract
              </button>
              <button
                className="button button-danger"
                onClick={resetCount}
              >
                🔄 Reset Count
              </button>
              <button
                className="button button-danger"
                onClick={clearImage}
              >
                🗑️ Clear Image
              </button>
            </div>
          </div>

          <div className="image-container">
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                ref={imageRef}
                src={image}
                alt="Medical image"
                className="image-preview"
                onClick={handleImageClick}
                style={{ cursor: 'crosshair' }}
              />
              {markers.map((marker) => (
                <div
                  key={marker.id}
                  className="marker"
                  style={{
                    left: `${marker.x}px`,
                    top: `${marker.y}px`
                  }}
                  onClick={(e) => handleMarkerClick(e, marker.id)}
                  title="Click to remove"
                />
              ))}
            </div>
          </div>

          <div className="instructions">
            <h3>Tips:</h3>
            <ul>
              <li>Click directly on cells in the image to mark them</li>
              <li>Red markers appear where you click</li>
              <li>Click any marker to remove it</li>
              <li>The count updates automatically</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
