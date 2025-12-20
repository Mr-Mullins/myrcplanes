'use client'

import { useState, useEffect } from 'react'
import { setThumbnail, deleteImage } from '@/lib/imageService'
import type { PlaneImage } from '@/lib/types'

interface ImageGalleryProps {
  images: PlaneImage[]
  planeId: number
  onUpdate: () => void
}

export default function ImageGallery({ images, planeId, onUpdate }: ImageGalleryProps) {
  const [loadingImageId, setLoadingImageId] = useState<number | null>(null)
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null)
  const [showCarousel, setShowCarousel] = useState(false)

  const handleSetThumbnail = async (imageId: number) => {
    setLoadingImageId(imageId)
    try {
      const result = await setThumbnail(imageId, planeId)
      if (result.error) {
        alert('Feil: ' + result.error)
      } else {
        onUpdate()
      }
    } finally {
      setLoadingImageId(null)
    }
  }

  const handleDelete = async (image: PlaneImage, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    
    if (!confirm('Er du sikker på at du vil slette dette bildet?')) {
      return
    }

    setDeletingImageId(image.id)
    try {
      const result = await deleteImage(image.id, image.image_url)
      if (result.error) {
        alert('Feil ved sletting: ' + result.error)
      } else {
        onUpdate()
      }
    } finally {
      setDeletingImageId(null)
    }
  }

  const openCarousel = (index: number) => {
    setCurrentImageIndex(index)
    setShowCarousel(true)
  }

  const closeCarousel = () => {
    setShowCarousel(false)
    setCurrentImageIndex(null)
  }

  const nextImage = () => {
    if (currentImageIndex !== null && currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  const prevImage = () => {
    if (currentImageIndex !== null && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    if (!showCarousel) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCarousel()
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showCarousel, currentImageIndex])

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="mt-2">Ingen bilder lastet opp ennå</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square cursor-pointer"
            onClick={() => openCarousel(index)}
          >
            <img
              src={image.image_url}
              alt={`Bilde ${image.display_order + 1}`}
              className="w-full h-full object-cover"
            />

          {/* Thumbnail Badge */}
          {image.is_thumbnail && (
            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
              Thumbnail
            </div>
          )}

          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <div className="flex flex-col gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openCarousel(index)
                }}
                className="px-3 py-2 bg-white text-gray-900 text-sm rounded hover:bg-gray-100 transition flex items-center gap-1"
                title="Se i full størrelse"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                Se større
              </button>
              
              {!image.is_thumbnail && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSetThumbnail(image.id)
                  }}
                  disabled={loadingImageId === image.id}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition disabled:bg-gray-400"
                  title="Sett som thumbnail"
                >
                  {loadingImageId === image.id ? (
                    'Lagrer...'
                  ) : (
                    <>
                      <svg className="inline h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Thumbnail
                    </>
                  )}
                </button>
              )}

              <button
                onClick={(e) => handleDelete(image, e)}
                disabled={deletingImageId === image.id}
                className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition disabled:bg-gray-400"
                title="Slett bilde"
              >
                {deletingImageId === image.id ? (
                  'Sletter...'
                ) : (
                  <>
                    <svg className="inline h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Slett
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        ))}
      </div>

      {/* Image Carousel Modal */}
      {showCarousel && currentImageIndex !== null && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeCarousel}
        >
          <button
            onClick={closeCarousel}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous button */}
          {currentImageIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
              className="absolute left-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition"
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div 
            className="max-w-7xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[currentImageIndex].image_url}
              alt={`Bilde ${currentImageIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
            
            {/* Image counter */}
            <div className="text-white text-center mt-4">
              <p className="text-lg">
                Bilde {currentImageIndex + 1} av {images.length}
              </p>
              {images[currentImageIndex].is_thumbnail && (
                <span className="inline-block mt-2 px-3 py-1 bg-blue-600 text-sm rounded-full">
                  Thumbnail
                </span>
              )}
            </div>
          </div>

          {/* Next button */}
          {currentImageIndex < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
              className="absolute right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition"
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Keyboard hints */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-lg">
            <span className="opacity-75">
              ← → for å navigere | ESC for å lukke
            </span>
          </div>
        </div>
      )}
    </>
  )
}


