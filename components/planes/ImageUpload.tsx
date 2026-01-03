'use client'

import { useState, useRef } from 'react'
import { uploadPlaneImage, saveImageMetadata, getImageCount } from '@/lib/imageService'

interface ImageUploadProps {
  planeId: number
  userId: string
  currentImageCount: number
  onUploadComplete: () => void
}

export default function ImageUpload({ 
  planeId, 
  userId, 
  currentImageCount,
  onUploadComplete 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxImages = 5
  const canUpload = currentImageCount < maxImages

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    
    // Validate file size
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setError('Filen er for stor. Maksimal størrelse er 5MB.')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Kun bildefiler er tillatt.')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload immediately
    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    setProgress('Laster opp...')
    setError('')

    try {
      // Check image count again
      const count = await getImageCount(planeId)
      if (count >= maxImages) {
        setError(`Maksimalt ${maxImages} bilder per fly.`)
        setUploading(false)
        return
      }

      // Upload image
      const result = await uploadPlaneImage(planeId, file, userId)
      
      if (result.error) {
        setError(result.error)
        setUploading(false)
        return
      }

      setProgress('Lagrer metadata...')

      // Save metadata
      const isFirstImage = count === 0
      const { error: metadataError } = await saveImageMetadata(
        planeId,
        result.url,
        isFirstImage, // First image is automatically thumbnail
        count
      )

      if (metadataError) {
        setError(metadataError)
        setUploading(false)
        return
      }

      setProgress('Fullført!')
      setPreview(null)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Notify parent
      setTimeout(() => {
        onUploadComplete()
        setUploading(false)
        setProgress('')
      }, 1000)
    } catch (err: any) {
      setError('Opplastingsfeil: ' + err.message)
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const event = {
        target: { files: [file] }
      } as any
      handleFileSelect(event)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  if (!canUpload) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-800 font-medium">
          Maksimalt {maxImages} bilder per fly er nådd
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {preview ? (
          <div className="space-y-3">
            <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded" />
            {uploading && (
              <div className="text-blue-600 font-medium">{progress}</div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-600">
              Klikk eller dra og slipp et bilde her
            </p>
            <p className="text-sm text-gray-500">
              Maks 5MB • {currentImageCount}/{maxImages} bilder
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}






