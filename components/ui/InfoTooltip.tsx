'use client'

import { useState } from 'react'

interface InfoTooltipProps {
  title: string
  description: string
}

export default function InfoTooltip({ title, description }: InfoTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative inline-block ml-2">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="text-blue-600 hover:text-blue-700 focus:outline-none"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {showTooltip && (
        <div className="absolute z-10 left-0 top-6 w-64 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg">
          <div className="font-semibold mb-1">{title}</div>
          <div className="text-gray-300">{description}</div>
          {/* Arrow */}
          <div className="absolute -top-2 left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900"></div>
        </div>
      )}
    </div>
  )
}




