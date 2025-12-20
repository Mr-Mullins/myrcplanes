'use client'

import { useState } from 'react'
import { usePlaneCalculations } from '@/hooks/usePlaneCalculations'

export default function Calculator() {
  const [measurements, setMeasurements] = useState({
    vingespenn: '',
    rotKorde: '',
    tippKorde: '',
    sweep: '0',
    haleSpenn: '',
    haleRotKorde: '',
    haleTippKorde: '',
    avstandVingeHale: ''
  })

  const calculations = usePlaneCalculations({
    vingespenn: parseFloat(measurements.vingespenn) || undefined,
    rotKorde: parseFloat(measurements.rotKorde) || undefined,
    tippKorde: parseFloat(measurements.tippKorde) || undefined,
    sweep: parseFloat(measurements.sweep) || 0,
    haleSpenn: parseFloat(measurements.haleSpenn) || undefined,
    haleRotKorde: parseFloat(measurements.haleRotKorde) || undefined,
    haleTippKorde: parseFloat(measurements.haleTippKorde) || undefined,
    avstandVingeHale: parseFloat(measurements.avstandVingeHale) || undefined
  })

  const handleChange = (field: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [field]: value }))
  }

  const handleReset = () => {
    setMeasurements({
      vingespenn: '',
      rotKorde: '',
      tippKorde: '',
      sweep: '0',
      haleSpenn: '',
      haleRotKorde: '',
      haleTippKorde: '',
      avstandVingeHale: ''
    })
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Målinger</h2>
          <button
            onClick={handleReset}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Nullstill
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vingespenn (cm) *
            </label>
            <input
              type="number"
              step="0.1"
              value={measurements.vingespenn}
              onChange={(e) => handleChange('vingespenn', e.target.value)}
              placeholder="F.eks. 48"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rot korde (cm) *
            </label>
            <input
              type="number"
              step="0.1"
              value={measurements.rotKorde}
              onChange={(e) => handleChange('rotKorde', e.target.value)}
              placeholder="F.eks. 9"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipp korde (cm) *
            </label>
            <input
              type="number"
              step="0.1"
              value={measurements.tippKorde}
              onChange={(e) => handleChange('tippKorde', e.target.value)}
              placeholder="F.eks. 8.8"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sweep (cm)
            </label>
            <input
              type="number"
              step="0.1"
              value={measurements.sweep}
              onChange={(e) => handleChange('sweep', e.target.value)}
              placeholder="0 for rette vinger"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hale spenn (cm)
            </label>
            <input
              type="number"
              step="0.1"
              value={measurements.haleSpenn}
              onChange={(e) => handleChange('haleSpenn', e.target.value)}
              placeholder="F.eks. 20"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hale rot korde (cm)
            </label>
            <input
              type="number"
              step="0.1"
              value={measurements.haleRotKorde}
              onChange={(e) => handleChange('haleRotKorde', e.target.value)}
              placeholder="F.eks. 6"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hale tipp korde (cm)
            </label>
            <input
              type="number"
              step="0.1"
              value={measurements.haleTippKorde}
              onChange={(e) => handleChange('haleTippKorde', e.target.value)}
              placeholder="Samme som rot hvis firkantet"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Avstand vinge-hale (cm)
            </label>
            <input
              type="number"
              step="0.1"
              value={measurements.avstandVingeHale}
              onChange={(e) => handleChange('avstandVingeHale', e.target.value)}
              placeholder="F.eks. 26"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Results Section */}
      {calculations ? (
        <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-6">Resultater</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Vingeareal</div>
              <div className="text-3xl font-bold text-blue-900">{calculations.vingeAreal}</div>
              <div className="text-xs text-gray-500 mt-1">cm²</div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Haleareal</div>
              <div className="text-3xl font-bold text-blue-900">{calculations.haleAreal}</div>
              <div className="text-xs text-gray-500 mt-1">cm²</div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">MAC</div>
              <div className="text-3xl font-bold text-blue-900">{calculations.mac}</div>
              <div className="text-xs text-gray-500 mt-1">cm</div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm md:col-span-3 grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">CG Fra (25% MAC)</div>
                <div className="text-3xl font-bold text-green-700">{calculations.anbefaltCG.fra}</div>
                <div className="text-xs text-gray-500 mt-1">cm - Veldig stabilt</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">CG Til (33% MAC)</div>
                <div className="text-3xl font-bold text-green-700">{calculations.anbefaltCG.til}</div>
                <div className="text-xs text-gray-500 mt-1">cm - Nøytralt/Acro</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-blue-700 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Hvordan måle</p>
                <p className="text-sm text-blue-800">{calculations.beskjed}</p>
                <p className="text-sm text-blue-700 mt-2">
                  CG-området fra {calculations.anbefaltCG.fra} til {calculations.anbefaltCG.til} cm gir deg et trygt område 
                  å balansere flyet i. Start nærmere {calculations.anbefaltCG.fra} cm for mer stabilitet.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Ekstra informasjon</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>MAC Start (fra vingerot):</span>
                <span className="font-medium">{calculations.macStart} cm</span>
              </div>
              <div className="flex justify-between">
                <span>25% MAC (Veldig stabilt):</span>
                <span className="font-medium">{calculations.anbefaltCG.fra} cm</span>
              </div>
              <div className="flex justify-between">
                <span>33% MAC (Nøytralt/Acro):</span>
                <span className="font-medium">{calculations.anbefaltCG.til} cm</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 text-lg">Fyll inn målingene for å se resultatene</p>
          <p className="text-gray-500 text-sm mt-2">
            Minimum: vingespenn, rot korde og tipp korde
          </p>
        </div>
      )}

      {/* Print Button */}
      {calculations && (
        <div className="text-center">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition inline-flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Skriv ut
          </button>
        </div>
      )}
    </div>
  )
}

