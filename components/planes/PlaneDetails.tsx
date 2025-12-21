'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ImageUpload from './ImageUpload'
import ImageGallery from './ImageGallery'
import type { RCPlane, PlaneImage } from '@/lib/types'

interface PlaneDetailsProps {
  plane: RCPlane
  onEdit: () => void
  onClose: () => void
  onDeleted: () => void
  onNextPlane?: () => void
  onPrevPlane?: () => void
  planeIndex?: { current: number, total: number }
}

export default function PlaneDetails({ 
  plane, 
  onEdit, 
  onClose, 
  onDeleted,
  onNextPlane,
  onPrevPlane,
  planeIndex
}: PlaneDetailsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'images'>('details')
  const [images, setImages] = useState<PlaneImage[]>(plane.images || [])
  const [userId, setUserId] = useState<string>('')
  const [showCarousel, setShowCarousel] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null)
  
  // Swipe detection
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  useEffect(() => {
    fetchImages()
    fetchUserId()
  }, [plane.id])

  useEffect(() => {
    // Update images when plane prop changes
    if (plane.images && plane.images.length > 0) {
      setImages(plane.images)
    }
  }, [plane.images])

  const fetchUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUserId(user.id)
  }

  const fetchImages = async () => {
    const { data } = await supabase
      .from('plane_images')
      .select('*')
      .eq('plane_id', plane.id)
      .order('display_order')
    
    if (data) setImages(data)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      // Delete plane (images will be deleted automatically via CASCADE)
      const { error } = await supabase
        .from('rc_planes')
        .delete()
        .eq('id', plane.id)

      if (error) throw error

      // Delete images from storage
      if (plane.images && plane.images.length > 0) {
        const imagePaths = plane.images.map(img => {
          const url = new URL(img.image_url)
          return url.pathname.split('/').slice(-2).join('/')
        })
        
        await supabase.storage
          .from('plane-images')
          .remove(imagePaths)
      }

      onDeleted()
    } catch (error: any) {
      console.error('Error deleting plane:', error)
      alert('Feil ved sletting: ' + error.message)
      setDeleting(false)
    }
  }

  const getThumbnail = () => {
    const thumbnail = images?.find(img => img.is_thumbnail)
    return thumbnail?.image_url || images?.[0]?.image_url
  }

  const getThumbnailIndex = () => {
    const thumbnailIndex = images?.findIndex(img => img.is_thumbnail)
    return thumbnailIndex !== -1 ? thumbnailIndex : 0
  }

  const openCarousel = () => {
    if (images.length === 0) return
    const thumbnailIndex = getThumbnailIndex()
    setCurrentImageIndex(thumbnailIndex)
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

  // Keyboard navigation for carousel
  useEffect(() => {
    if (!showCarousel) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCarousel()
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showCarousel, currentImageIndex, images.length])

  // Keyboard navigation for plane switching (only when carousel is not open)
  useEffect(() => {
    if (showCarousel) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && onNextPlane) {
        e.preventDefault()
        onNextPlane()
      }
      if (e.key === 'ArrowLeft' && onPrevPlane) {
        e.preventDefault()
        onPrevPlane()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showCarousel, onNextPlane, onPrevPlane])

  // Swipe detection
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && onNextPlane) {
      onNextPlane()
    }
    if (isRightSwipe && onPrevPlane) {
      onPrevPlane()
    }
  }

  const hasNavigation = planeIndex && planeIndex.total > 1
  const canGoPrev = hasNavigation && planeIndex.current > 1
  const canGoNext = hasNavigation && planeIndex.current < planeIndex.total

  return (
    <div 
      className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto overflow-hidden relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-sky-500 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Navigation buttons in header */}
          {hasNavigation && (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={onPrevPlane}
                disabled={!canGoPrev}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Forrige fly (←)"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={onNextPlane}
                disabled={!canGoNext}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Neste fly (→)"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          <h2 className="text-2xl font-bold text-white">{plane.name}</h2>
          
          {hasNavigation && (
            <span className="text-blue-900 text-sm bg-white px-3 py-1 rounded-full font-medium">
              {planeIndex.current} / {planeIndex.total}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Detaljer
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === 'images'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Bilder ({images.length}/5)
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {activeTab === 'details' ? (
          <>
        {/* Image */}
        {getThumbnail() ? (
          <div 
            className="relative group cursor-pointer overflow-hidden rounded-lg" 
            onClick={openCarousel}
          >
            <img
              src={getThumbnail()}
              alt={plane.name}
              className="w-full h-64 object-cover rounded-lg"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none" />
            {/* Zoom icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-white rounded-full p-3 shadow-lg">
                <svg className="h-8 w-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </div>
            </div>
            {/* Hint text */}
            <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Klikk for å se større
            </div>
          </div>
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center rounded-lg">
            <svg className="h-24 w-24 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Basic Info */}
        {(plane.manufacturer || plane.model) && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Produsent & Modell</h3>
            <p className="text-lg text-gray-900">
              {[plane.manufacturer, plane.model].filter(Boolean).join(' - ')}
            </p>
          </div>
        )}

        {/* Aerodynamic Data */}
        {(plane.vingespenn || plane.rot_korde || plane.tipp_korde) && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Aerodynamiske målinger</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {plane.vingespenn && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600">Vingespenn</div>
                  <div className="text-lg font-semibold text-gray-900">{plane.vingespenn} cm</div>
                </div>
              )}
              {plane.rot_korde && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600">Rot korde</div>
                  <div className="text-lg font-semibold text-gray-900">{plane.rot_korde} cm</div>
                </div>
              )}
              {plane.tipp_korde && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600">Tipp korde</div>
                  <div className="text-lg font-semibold text-gray-900">{plane.tipp_korde} cm</div>
                </div>
              )}
              {plane.sweep !== null && plane.sweep !== undefined && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600">Sweep</div>
                  <div className="text-lg font-semibold text-gray-900">{plane.sweep} cm</div>
                </div>
              )}
              {plane.hale_spenn && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600">Hale spenn</div>
                  <div className="text-lg font-semibold text-gray-900">{plane.hale_spenn} cm</div>
                </div>
              )}
              {plane.hale_rot_korde && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600">Hale rot korde</div>
                  <div className="text-lg font-semibold text-gray-900">{plane.hale_rot_korde} cm</div>
                </div>
              )}
              {plane.hale_tipp_korde && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600">Hale tipp korde</div>
                  <div className="text-lg font-semibold text-gray-900">{plane.hale_tipp_korde} cm</div>
                </div>
              )}
              {plane.avstand_vinge_hale && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600">Avstand vinge-hale</div>
                  <div className="text-lg font-semibold text-gray-900">{plane.avstand_vinge_hale} cm</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calculated Values */}
        {(plane.vinge_areal || plane.hale_areal || plane.mac || plane.cg_fremre || plane.cg_bakre) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-3">Beregnede verdier</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {plane.vinge_areal && (
                <div>
                  <div className="text-xs text-blue-700">Vingeareal</div>
                  <div className="text-lg font-semibold text-blue-900">{plane.vinge_areal} cm²</div>
                </div>
              )}
              {plane.hale_areal && (
                <div>
                  <div className="text-xs text-blue-700">Haleareal</div>
                  <div className="text-lg font-semibold text-blue-900">{plane.hale_areal} cm²</div>
                </div>
              )}
              {plane.mac && (
                <div>
                  <div className="text-xs text-blue-700">MAC</div>
                  <div className="text-lg font-semibold text-blue-900">{plane.mac} cm</div>
                </div>
              )}
              {plane.cg_fremre && (
                <div>
                  <div className="text-xs text-blue-700">CG Fra (25%)</div>
                  <div className="text-lg font-semibold text-blue-900">{plane.cg_fremre} cm</div>
                </div>
              )}
              {plane.cg_bakre && (
                <div>
                  <div className="text-xs text-blue-700">CG Til (33%)</div>
                  <div className="text-lg font-semibold text-blue-900">{plane.cg_bakre} cm</div>
                </div>
              )}
            </div>
            <p className="text-xs text-blue-700 mt-3">Mål dette fra der vingen starter (fremkant) inne ved kroppen.</p>
          </div>
        )}

        {/* Notes */}
        {plane.notes && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Notater</h3>
            <p className="text-gray-900 whitespace-pre-wrap">{plane.notes}</p>
          </div>
        )}

          </>
        ) : (
          <>
            {/* Images Tab */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Last opp bilder</h3>
              <ImageUpload
                planeId={plane.id}
                userId={userId}
                currentImageCount={images.length}
                onUploadComplete={fetchImages}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bildegalleri</h3>
              <ImageGallery
                images={images}
                planeId={plane.id}
                onUpdate={fetchImages}
              />
            </div>
          </>
        )}
      </div>

      {/* Mobile Navigation Hint */}
      {hasNavigation && (
        <div className="md:hidden bg-gray-100 px-6 py-3 text-center border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Swipe for å bla mellom fly
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        {showDeleteConfirm ? (
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="text-red-700 font-medium">Er du sikker?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400"
            >
              {deleting ? 'Sletter...' : 'Ja, slett'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Avbryt
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Mobile navigation buttons */}
            {hasNavigation && (
              <div className="flex gap-2 md:hidden order-first">
                <button
                  onClick={onPrevPlane}
                  disabled={!canGoPrev}
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Forrige
                </button>
                <button
                  onClick={onNextPlane}
                  disabled={!canGoNext}
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Neste
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Main actions */}
            <div className="flex justify-between items-center flex-1">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
              >
                Slett fly
              </button>
              <button
                onClick={onEdit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Rediger
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox/Carousel */}
      {showCarousel && currentImageIndex !== null && images[currentImageIndex] && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
          onClick={closeCarousel}
        >
          {/* Close button */}
          <button
            onClick={closeCarousel}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
          >
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 text-white text-lg bg-black bg-opacity-50 px-4 py-2 rounded-lg">
            {currentImageIndex + 1} / {images.length}
          </div>

          {/* Previous button */}
          {currentImageIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-3"
            >
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Current Image */}
          <div 
            className="relative max-w-7xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[currentImageIndex].image_url}
              alt={`${plane.name} - Bilde ${currentImageIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            
            {/* Thumbnail indicator */}
            {images[currentImageIndex].is_thumbnail && (
              <div className="absolute bottom-4 left-4 bg-blue-600 text-white text-sm px-3 py-1 rounded-lg flex items-center gap-2">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Hovedbilde
              </div>
            )}
          </div>

          {/* Next button */}
          {currentImageIndex < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-3"
            >
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Keyboard hints */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-lg">
            Bruk piltastene (← →) eller ESC for å lukke
          </div>
        </div>
      )}
    </div>
  )
}

