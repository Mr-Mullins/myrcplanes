'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { RCPlane } from '@/lib/types'

interface PlaneListProps {
  onAddPlane: () => void
  onSelectPlane: (plane: RCPlane) => void
}

export default function PlaneList({ onAddPlane, onSelectPlane }: PlaneListProps) {
  const [planes, setPlanes] = useState<RCPlane[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchPlanes()
  }, [])

  const fetchPlanes = async () => {
    try {
      const { data: planesData, error: planesError } = await supabase
        .from('rc_planes')
        .select('*')
        .order('created_at', { ascending: false })

      if (planesError) throw planesError

      // Fetch images for each plane
      if (planesData && planesData.length > 0) {
        const planeIds = planesData.map(p => p.id)
        const { data: imagesData } = await supabase
          .from('plane_images')
          .select('*')
          .in('plane_id', planeIds)

        // Attach images to planes
        const planesWithImages = planesData.map(plane => ({
          ...plane,
          images: imagesData?.filter(img => img.plane_id === plane.id) || []
        }))

        setPlanes(planesWithImages)
      } else {
        setPlanes(planesData || [])
      }
    } catch (error) {
      console.error('Error fetching planes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPlanes = planes.filter(plane => 
    plane.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plane.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plane.model?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getThumbnail = (plane: RCPlane) => {
    const thumbnail = plane.images?.find(img => img.is_thumbnail)
    return thumbnail?.image_url || plane.images?.[0]?.image_url
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Laster fly...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Mine fly</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Søk fly..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={onAddPlane}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
          >
            + Legg til fly
          </button>
        </div>
      </div>

      {filteredPlanes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <p className="mt-4">
            {searchQuery ? 'Ingen fly funnet' : 'Ingen fly registrert ennå'}
          </p>
          <p className="text-sm mt-2">
            {searchQuery ? 'Prøv et annet søk' : 'Klikk på "Legg til fly" for å komme i gang'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlanes.map((plane) => (
            <div
              key={plane.id}
              onClick={() => onSelectPlane(plane)}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
            >
              {getThumbnail(plane) ? (
                <img
                  src={getThumbnail(plane)}
                  alt={plane.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center">
                  <svg className="h-16 w-16 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {plane.name}
                </h3>
                
                {(plane.manufacturer || plane.model) && (
                  <p className="text-sm text-gray-600 mb-2">
                    {[plane.manufacturer, plane.model].filter(Boolean).join(' - ')}
                  </p>
                )}
                
                {plane.vingespenn && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Vingespenn: {plane.vingespenn} cm</span>
                  </div>
                )}
                
                {plane.cg_fremre && plane.cg_bakre && (
                  <div className="mt-2 text-sm text-gray-500">
                    CG: {plane.cg_fremre} - {plane.cg_bakre} cm
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

