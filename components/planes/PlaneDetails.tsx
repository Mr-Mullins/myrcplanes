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
}

export default function PlaneDetails({ plane, onEdit, onClose, onDeleted }: PlaneDetailsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'images'>('details')
  const [images, setImages] = useState<PlaneImage[]>(plane.images || [])
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    fetchImages()
    fetchUserId()
  }, [plane.id])

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

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-sky-500 px-6 py-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">{plane.name}</h2>
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
          <img
            src={getThumbnail()}
            alt={plane.name}
            className="w-full h-64 object-cover rounded-lg"
          />
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

      {/* Actions */}
      <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
        {showDeleteConfirm ? (
          <div className="flex items-center gap-3 flex-1">
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
          <>
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
          </>
        )}
      </div>
    </div>
  )
}

