import React, { useEffect, useRef } from 'react'
import { EditorView, minimalSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { placeholder } from '@codemirror/view'

const BRAND = '#818cf8'
const SEL_BG = 'rgba(129, 140, 248, 0.35)'

const PlainTextEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!editorRef.current) return

    const state = EditorState.create({
      doc: '',
      extensions: [
        minimalSetup,
        placeholder('Enter notes...'),
        EditorView.theme({
          '&': {
            color: 'rgba(255, 255, 255, 0.85)',
            backgroundColor: 'transparent',
            height: '100%',
            outline: '1px solid rgba(129, 140, 248, 0.60)',
            outlineOffset: '2px',
          },

          // Focus ring
          '&.cm-focused': {
            outline: '1px solid rgba(129, 140, 248, 0.60)',
            outlineOffset: '2px',
          },

          // Caret & cursor
          '&.cm-focused .cm-cursor': { borderLeftColor: BRAND },

          // Selection (drawn only)
          "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
            backgroundColor: SEL_BG,
          },
        }, { dark: true })
      ]
    })

    viewRef.current = new EditorView({ state, parent: editorRef.current })
    return () => viewRef.current?.destroy()
  }, [])

  return <div ref={editorRef} style={{ minHeight: '200px', height: '100%' }} />
}

export default PlainTextEditor
