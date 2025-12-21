'use client'

import { useRef, useEffect } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  const insertList = (ordered: boolean) => {
    execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList')
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        {/* Headers */}
        <select
          onChange={(e) => execCommand('formatBlock', e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50"
          defaultValue=""
        >
          <option value="">Normal</option>
          <option value="h1">Overskrift 1</option>
          <option value="h2">Overskrift 2</option>
          <option value="h3">Overskrift 3</option>
        </select>

        <div className="border-l border-gray-300 mx-1"></div>

        {/* Text formatting */}
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 font-bold"
          title="Fet (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 italic"
          title="Kursiv (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 underline"
          title="Understrek (Ctrl+U)"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => execCommand('strikeThrough')}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 line-through"
          title="Gjennomstreking"
        >
          S
        </button>

        <div className="border-l border-gray-300 mx-1"></div>

        {/* Lists */}
        <button
          type="button"
          onClick={() => insertList(false)}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200"
          title="Punktliste"
        >
          • Liste
        </button>
        <button
          type="button"
          onClick={() => insertList(true)}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200"
          title="Nummerert liste"
        >
          1. Liste
        </button>

        <div className="border-l border-gray-300 mx-1"></div>

        {/* Colors */}
        <input
          type="color"
          onChange={(e) => execCommand('foreColor', e.target.value)}
          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
          title="Tekstfarge"
        />
        <input
          type="color"
          onChange={(e) => execCommand('hiliteColor', e.target.value)}
          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
          title="Bakgrunnsfarge"
        />

        <div className="border-l border-gray-300 mx-1"></div>

        {/* Link */}
        <button
          type="button"
          onClick={() => {
            const url = prompt('Skriv inn lenke (URL):')
            if (url) execCommand('createLink', url)
          }}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 text-blue-600"
          title="Sett inn lenke"
        >
          🔗
        </button>

        {/* Clear formatting */}
        <button
          type="button"
          onClick={() => execCommand('removeFormat')}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200"
          title="Fjern formatering"
        >
          ✕ Fjern
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[200px] p-4 focus:outline-none prose prose-sm max-w-none"
        data-placeholder={placeholder || 'Skriv notater her...'}
        style={{
          minHeight: '200px',
        }}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          display: block;
        }
      `}</style>
    </div>
  )
}
