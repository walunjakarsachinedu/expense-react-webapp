import React, { useEffect, useRef } from 'react'
import { EditorView, minimalSetup } from 'codemirror'
import { EditorState, Compartment } from '@codemirror/state'
import { placeholder } from '@codemirror/view'

const BRAND = '#818cf8'
const SEL_BG = 'rgba(129, 140, 248, 0.35)'

type Props = {
  value?: string
  onChange?: (txt: string) => void
  placeholderText?: string
}

const PlainTextEditor = ({ value = '', onChange, placeholderText = 'Enter notes...' }: Props) => {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<EditorView | null>(null)

  const placeholderCompartment = useRef(new Compartment()).current
  const themeCompartment = useRef(new Compartment()).current

  useEffect(() => {
    if (!hostRef.current) return

    const updateListener = EditorView.updateListener.of((update) => {
      if (!update.docChanged) return
      onChange?.(update.state.doc.toString())
    })

    const theme = EditorView.theme({
      '&': {
        color: 'var(--text-color)',
        backgroundColor: 'var(--surface-ground)',
        fontFamily: 'var(--font-family)',
        fontWeight: 400,
        height: '100%',
        outline: '1px solid rgba(129, 140, 248, 0.60)',
        outlineOffset: '2px',
      },
      '&.cm-focused': {
        outline: '1px solid rgba(129, 140, 248, 0.60)',
        outlineOffset: '2px',
      },
      '.cm-content': {
        fontFamily: 'var(--font-family)',
        fontWeight: 400,
        caretColor: BRAND,
      },
      '&.cm-focused .cm-cursor': { borderLeftColor: BRAND },
      // selection (drawn and native)
      '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, .cm-content ::selection': {
        backgroundColor: SEL_BG,
      },
    }, { dark: true })

    const state = EditorState.create({
      doc: value,
      extensions: [
        minimalSetup,
        placeholderCompartment.of(placeholder(placeholderText)),
        themeCompartment.of(theme),
        updateListener,
      ],
    })

    viewRef.current = new EditorView({ state, parent: hostRef.current })
    return () => {
      viewRef.current?.destroy()
      viewRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // mount once

  // controlled value -> editor
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (value !== current) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value ?? '' },
      })
    }
  }, [value])

  // update placeholder without recreating editor
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    view.dispatch({
      effects: placeholderCompartment.reconfigure(placeholder(placeholderText)),
    })
  }, [placeholderText, placeholderCompartment])

  return <div ref={hostRef} style={{ minHeight: '200px', height: '100%' }} />
}

export default PlainTextEditor
