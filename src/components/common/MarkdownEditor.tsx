import { useEffect, useRef } from "react"
import { DragHandleButton, SideMenu, SideMenuController, useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/mantine/style.css"
import "./MarkdownEditor.scss"

type Props = {
  initialValue?: string
  onChange?: (txt: string) => void
  placeholderText?: string
}

export default function MarkdownEditor(props: Props) {
  const editor = useCreateBlockNote({
    placeholders: {
      default: props.placeholderText ?? "Write something..."
    }
  })

  /** Prevents re-loading of editor after initialValue change. */
  const loadedRef = useRef(false)
  /** Prevent un-necessarily firing of onChange event while editor is loading. */
  const loadingRef = useRef(true)

useEffect(() => {
  function load(): void {
    if (loadedRef.current) return;

    try {
      if (props.initialValue) {
        const blocks = editor.tryParseMarkdownToBlocks(props.initialValue);
        editor.replaceBlocks(editor.document, blocks);
      }
    } catch (error) {
      console.error("Failed to parse markdown", error);
    } finally {
      loadedRef.current = true;

      // Intentionally adds small delay to ensure the editor has processed 
      // the replacement before allowing onChange to fire.
      setTimeout(() => {
        loadingRef.current = false;
      }, 0);
    }
  }

  load();
}, [editor, props.initialValue]);

  async function handleChange(): Promise<void> {
    if (loadingRef.current) return
    if (!loadedRef.current || !props.onChange) return
    const md = await editor.blocksToMarkdownLossy(editor.document)
    props.onChange(md)
  }

  return (
    <div className="MarkdownEditor">
      <BlockNoteView editor={editor} onChange={handleChange} sideMenu={false}>
        <SideMenuController
          sideMenu={(props) => (
            <SideMenu {...props}>
              <DragHandleButton {...props} />
            </SideMenu>
          )}
        />
      </BlockNoteView>
    </div>
  )
}