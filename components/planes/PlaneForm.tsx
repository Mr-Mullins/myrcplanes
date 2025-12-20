'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { usePlaneCalculations } from '@/hooks/usePlaneCalculations'
import InfoTooltip from '@/components/ui/InfoTooltip'
import type { RCPlane, PlaneFormData } from '@/lib/types'

interface PlaneFormProps {
  plane?: RCPlane
  onSuccess: () => void
  onCancel: () => void
}

export default function PlaneForm({ plane, onSuccess, onCancel }: PlaneFormProps) {
  const [formData, setFormData] = useState<PlaneFormData>({
    name: plane?.name || '',
    manufacturer: plane?.manufacturer || '',
    model: plane?.model || '',
    vingespenn: plane?.vingespenn?.toString() || '',
    rot_korde: plane?.rot_korde?.toString() || '',
    tipp_korde: plane?.tipp_korde?.toString() || '',
    sweep: plane?.sweep?.toString() || '0',
    hale_spenn: plane?.hale_spenn?.toString() || '',
    hale_rot_korde: plane?.hale_rot_korde?.toString() || '',
    hale_tipp_korde: plane?.hale_tipp_korde?.toString() || '',
    avstand_vinge_hale: plane?.avstand_vinge_hale?.toString() || '',
    notes: plane?.notes || ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Real-time calculations
  const calculations = usePlaneCalculations({
    vingespenn: parseFloat(formData.vingespenn) || undefined,
    rotKorde: parseFloat(formData.rot_korde) || undefined,
    tippKorde: parseFloat(formData.tipp_korde) || undefined,
    sweep: parseFloat(formData.sweep) || 0,
    haleSpenn: parseFloat(formData.hale_spenn) || undefined,
    haleRotKorde: parseFloat(formData.hale_rot_korde) || undefined,
    haleTippKorde: parseFloat(formData.hale_tipp_korde) || undefined,
    avstandVingeHale: parseFloat(formData.avstand_vinge_hale) || undefined
  })

  const handleChange = (field: keyof PlaneFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    if (!formData.name.trim()) {
      setMessage('Navn er påkrevd')
      return
    }

    setLoading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMessage('Du må være innlogget for å lagre')
        setLoading(false)
        return
      }

      const planeData = {
        user_id: user.id,
        name: formData.name.trim(),
        manufacturer: formData.manufacturer.trim() || null,
        model: formData.model.trim() || null,
        vingespenn: formData.vingespenn ? parseFloat(formData.vingespenn) : null,
        rot_korde: formData.rot_korde ? parseFloat(formData.rot_korde) : null,
        tipp_korde: formData.tipp_korde ? parseFloat(formData.tipp_korde) : null,
        sweep: formData.sweep ? parseFloat(formData.sweep) : 0,
        hale_spenn: formData.hale_spenn ? parseFloat(formData.hale_spenn) : null,
        hale_rot_korde: formData.hale_rot_korde ? parseFloat(formData.hale_rot_korde) : null,
        hale_tipp_korde: formData.hale_tipp_korde ? parseFloat(formData.hale_tipp_korde) : null,
        avstand_vinge_hale: formData.avstand_vinge_hale ? parseFloat(formData.avstand_vinge_hale) : null,
        vinge_areal: calculations?.vingeAreal || null,
        hale_areal: calculations?.haleAreal || null,
        mac: calculations?.mac || null,
        cg_fremre: calculations?.anbefaltCG.fra || null,
        cg_bakre: calculations?.anbefaltCG.til || null,
        notes: formData.notes.trim() || null,
        updated_at: new Date().toISOString()
      }

      if (plane) {
        // Update existing plane - don't update user_id
        const { user_id, ...updateData } = planeData
        const { error } = await supabase
          .from('rc_planes')
          .update(updateData)
          .eq('id', plane.id)

        if (error) throw error
        setMessage('Fly oppdatert!')
      } else {
        // Insert new plane
        const { error } = await supabase
          .from('rc_planes')
          .insert([planeData])

        if (error) throw error
        setMessage('Fly lagt til!')
      }

      setTimeout(() => {
        onSuccess()
      }, 1000)
    } catch (error: any) {
      setMessage('Feil: ' + error.message)
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {plane ? 'Rediger fly' : 'Legg til nytt fly'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.includes('Feil') 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Grunnleggende informasjon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Navn *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                placeholder="F.eks. Min Cessna"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produsent
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => handleChange('manufacturer', e.target.value)}
                placeholder="F.eks. E-flite"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modell
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder="F.eks. Apprentice S 15e"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Aerodynamic Measurements */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Aerodynamiske målinger - Vinge
            <span className="text-sm font-normal text-gray-500 ml-2">(alle mål i cm)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Vingespenn (spiss til spiss)
                <InfoTooltip 
                  title="Vingespenn"
                  description="Mål avstanden fra vingetuppen på den ene siden til vingetuppen på den andre siden. Dette er den totale bredden av flyet målt over vingene."
                />
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.vingespenn}
                onChange={(e) => handleChange('vingespenn', e.target.value)}
                placeholder="F.eks. 150 cm"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Rot korde (ved kroppen)
                <InfoTooltip 
                  title="Rot korde"
                  description="Mål avstanden fra vingens fremkant til bakkant der vingen møter kroppen (ved roten). Dette er vingens bredde inne ved kroppen."
                />
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.rot_korde}
                onChange={(e) => handleChange('rot_korde', e.target.value)}
                placeholder="F.eks. 18 cm"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Tipp korde (ved vingespiss)
                <InfoTooltip 
                  title="Tipp korde"
                  description="Mål avstanden fra vingens fremkant til bakkant ved vingetippen (ytterst på vingen). Dette er vingens bredde ved spissen."
                />
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.tipp_korde}
                onChange={(e) => handleChange('tipp_korde', e.target.value)}
                placeholder="F.eks. 12 cm"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Sweep (tilbakesveip)
                <InfoTooltip 
                  title="Sweep"
                  description="Mål hvor mye vingens fremkant er sveipt bakover. Hvis vingen er rett (ikke sveipt), sett dette til 0. Måles som avstanden mellom vingens fremkant ved roten og ved tippen."
                />
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.sweep}
                onChange={(e) => handleChange('sweep', e.target.value)}
                placeholder="0 for rette vinger"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Tail Measurements */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Aerodynamiske målinger - Hale
            <span className="text-sm font-normal text-gray-500 ml-2">(valgfritt, men anbefalt)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Hale spenn (spiss til spiss)
                <InfoTooltip 
                  title="Hale spenn"
                  description="Mål halens totale bredde fra spiss til spiss (høyreroret), akkurat som vingespenn men for halen. Dette er avstanden fra den ene siden av haleplanet til den andre."
                />
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.hale_spenn}
                onChange={(e) => handleChange('hale_spenn', e.target.value)}
                placeholder="F.eks. 50 cm"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Hale rot korde (ved kroppen)
                <InfoTooltip 
                  title="Hale rot korde"
                  description="Mål halens bredde (fra fremkant til bakkant) der den møter kroppen/halefinnen. Dette er den bredeste delen av halen."
                />
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.hale_rot_korde}
                onChange={(e) => handleChange('hale_rot_korde', e.target.value)}
                placeholder="F.eks. 12 cm"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Hale tipp korde (ved spiss)
                <InfoTooltip 
                  title="Hale tipp korde"
                  description="Mål halens bredde (fra fremkant til bakkant) ved spissen. Hvis halen er firkantet (lik bredde overalt), kan du la dette feltet stå tomt."
                />
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.hale_tipp_korde}
                onChange={(e) => handleChange('hale_tipp_korde', e.target.value)}
                placeholder="La stå tom hvis firkantet"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Avstand vinge til hale
                <InfoTooltip 
                  title="Avstand vinge-hale"
                  description="Mål avstanden fra der vingen starter (ved kroppen) til der halen starter. Dette er lengden på kroppen mellom vinge og hale."
                />
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.avstand_vinge_hale}
                onChange={(e) => handleChange('avstand_vinge_hale', e.target.value)}
                placeholder="F.eks. 80 cm"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Calculated Values */}
        {calculations && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Beregnede verdier
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <div className="text-blue-700 font-medium">Vingeareal</div>
                <div className="text-blue-900 text-lg">{calculations.vingeAreal} cm²</div>
              </div>
              <div>
                <div className="text-blue-700 font-medium">Haleareal</div>
                <div className="text-blue-900 text-lg">{calculations.haleAreal} cm²</div>
              </div>
              <div>
                <div className="text-blue-700 font-medium">MAC</div>
                <div className="text-blue-900 text-lg">{calculations.mac} cm</div>
              </div>
              <div>
                <div className="text-blue-700 font-medium">CG Fra (25%)</div>
                <div className="text-blue-900 text-lg">{calculations.anbefaltCG.fra} cm</div>
              </div>
              <div>
                <div className="text-blue-700 font-medium">CG Til (33%)</div>
                <div className="text-blue-900 text-lg">{calculations.anbefaltCG.til} cm</div>
              </div>
            </div>
            <p className="text-xs text-blue-700 mt-3">{calculations.beskjed}</p>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notater
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={4}
            placeholder="Eventuelle notater om flyet..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Avbryt
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Lagrer...' : plane ? 'Oppdater' : 'Lagre'}
          </button>
        </div>
      </form>
    </div>
  )
}

