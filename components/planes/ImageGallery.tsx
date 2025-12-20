'use client'

import { useState } from 'react'
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

  const handleDelete = async (image: PlaneImage) => {
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <div
          key={image.id}
          className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
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
            {!image.is_thumbnail && (
              <button
                onClick={() => handleSetThumbnail(image.id)}
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
              onClick={() => handleDelete(image)}
              disabled={deletingImageId === image.id}
              className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition disabled:bg-gray-400"
              title="Slett bilde"
            >
              {deletingImageId === image.id ? (
                'Sletter...'
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

