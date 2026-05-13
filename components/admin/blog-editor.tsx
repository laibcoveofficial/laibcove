"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type RefObject,
} from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Link2,
  Image as ImageIcon,
  Table2,
  Code2,
  Minus,
  Undo2,
  Redo2,
  ChevronDown,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   Heading Dropdown
───────────────────────────────────────────────────────────────────────────── */
const HEADINGS = [
  { label: "Paragraph", tag: "p", cmd: "formatBlock", val: "p" },
  { label: "Heading 1", tag: "h1", cmd: "formatBlock", val: "h1" },
  { label: "Heading 2", tag: "h2", cmd: "formatBlock", val: "h2" },
  { label: "Heading 3", tag: "h3", cmd: "formatBlock", val: "h3" },
  { label: "Heading 4", tag: "h4", cmd: "formatBlock", val: "h4" },
  { label: "Heading 5", tag: "h5", cmd: "formatBlock", val: "h5" },
  { label: "Heading 6", tag: "h6", cmd: "formatBlock", val: "h6" },
];

function HeadingDropdown({ exec }: { exec: (cmd: string, val?: string) => void }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Paragraph");

  return (
    <div className="relative">
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen((o) => !o);
        }}
        className="flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm font-medium text-foreground hover:bg-[var(--surface-soft)]"
      >
        {selected}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-xl border border-border bg-background shadow-xl">
          {HEADINGS.map((h) => (
            <button
              key={h.val}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                exec(h.cmd, h.val);
                setSelected(h.label);
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
            >
              {h.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Toolbar Button
───────────────────────────────────────────────────────────────────────────── */
function ToolBtn({
  onClick,
  title,
  active,
  children,
}: {
  onClick: (e: React.MouseEvent) => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-[var(--brand-soft)] hover:text-[var(--brand)] ${
        active ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "text-foreground/70"
      }`}
    >
      {children}
    </button>
  );
}

const Divider = () => (
  <span className="mx-0.5 h-6 w-px self-center bg-border" />
);

/* ─────────────────────────────────────────────────────────────────────────────
   Insert Table Dialog
───────────────────────────────────────────────────────────────────────────── */
function buildTable(rows: number, cols: number): string {
  const head = `<thead><tr>${Array.from({ length: cols }, (_, i) => `<th>Header ${i + 1}</th>`).join("")}</tr></thead>`;
  const body = `<tbody>${Array.from({ length: rows - 1 }, () => `<tr>${Array.from({ length: cols }, () => "<td>&nbsp;</td>").join("")}</tr>`).join("")}</tbody>`;
  return `<table border="1" style="border-collapse:collapse;width:100%">${head}${body}</table><p><br></p>`;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Rich Editor
───────────────────────────────────────────────────────────────────────────── */
export function RichEditor({
  initialValue = "",
  onChange,
  onImageUpload,
}: {
  initialValue?: string;
  onChange?: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [uploading, setUploading] = useState(false);

  // Initialise content once
  useEffect(() => {
    if (editorRef.current && initialValue) {
      editorRef.current.innerHTML = initialValue;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = useCallback((cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    onChange?.(editorRef.current?.innerHTML ?? "");
  }, [onChange]);

  const handleInput = useCallback(() => {
    onChange?.(editorRef.current?.innerHTML ?? "");
  }, [onChange]);

  // Image insertion
  const handleImageInsert = useCallback(async (file: File) => {
    if (!onImageUpload) {
      // Fallback: local object URL (won't persist)
      const url = URL.createObjectURL(file);
      exec("insertImage", url);
      return;
    }
    setUploading(true);
    try {
      const url = await onImageUpload(file);
      exec("insertImage", url);
    } catch {
      alert("Image upload failed.");
    } finally {
      setUploading(false);
    }
  }, [exec, onImageUpload]);

  const handleLinkInsert = useCallback(() => {
    const url = prompt("Enter URL:", "https://");
    if (url) exec("createLink", url);
  }, [exec]);

  const handleTableInsert = useCallback(() => {
    const html = buildTable(tableRows, tableCols);
    exec("insertHTML", html);
    setShowTableDialog(false);
  }, [exec, tableRows, tableCols]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-[var(--surface-soft)] px-2 py-1.5">
        {/* Heading */}
        <HeadingDropdown exec={exec} />
        <Divider />

        {/* Inline formatting */}
        <ToolBtn title="Bold (Ctrl+B)" onClick={() => exec("bold")}>
          <Bold className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Italic (Ctrl+I)" onClick={() => exec("italic")}>
          <Italic className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Underline (Ctrl+U)" onClick={() => exec("underline")}>
          <Underline className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Strikethrough" onClick={() => exec("strikeThrough")}>
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Inline code" onClick={() => exec("insertHTML", "<code>&ZeroWidthSpace;</code>")}>
          <Code2 className="h-3.5 w-3.5" />
        </ToolBtn>
        <Divider />

        {/* Alignment */}
        <ToolBtn title="Align left" onClick={() => exec("justifyLeft")}>
          <AlignLeft className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Align center" onClick={() => exec("justifyCenter")}>
          <AlignCenter className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Align right" onClick={() => exec("justifyRight")}>
          <AlignRight className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Justify" onClick={() => exec("justifyFull")}>
          <AlignJustify className="h-3.5 w-3.5" />
        </ToolBtn>
        <Divider />

        {/* Lists */}
        <ToolBtn title="Bullet list" onClick={() => exec("insertUnorderedList")}>
          <List className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Numbered list" onClick={() => exec("insertOrderedList")}>
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Blockquote" onClick={() => exec("formatBlock", "blockquote")}>
          <Quote className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Horizontal rule" onClick={() => exec("insertHorizontalRule")}>
          <Minus className="h-3.5 w-3.5" />
        </ToolBtn>
        <Divider />

        {/* Link, Image, Table */}
        <ToolBtn title="Insert link" onClick={handleLinkInsert}>
          <Link2 className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn
          title="Insert image"
          onClick={() => fileInputRef.current?.click()}
          active={uploading}
        >
          <ImageIcon className="h-3.5 w-3.5" />
        </ToolBtn>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImageInsert(f);
            e.target.value = "";
          }}
        />
        <div className="relative">
          <ToolBtn title="Insert table" onClick={() => setShowTableDialog((o) => !o)}>
            <Table2 className="h-3.5 w-3.5" />
          </ToolBtn>
          {showTableDialog && (
            <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl border border-border bg-background p-3 shadow-xl">
              <p className="mb-2 text-xs font-semibold text-foreground">Insert Table</p>
              <div className="flex gap-2">
                <label className="flex-1">
                  <span className="text-xs text-muted-foreground">Rows</span>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={tableRows}
                    onChange={(e) => setTableRows(Number(e.target.value))}
                    className="mt-1 block w-full rounded-lg border border-border px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="flex-1">
                  <span className="text-xs text-muted-foreground">Cols</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={tableCols}
                    onChange={(e) => setTableCols(Number(e.target.value))}
                    className="mt-1 block w-full rounded-lg border border-border px-2 py-1.5 text-sm"
                  />
                </label>
              </div>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleTableInsert(); }}
                className="mt-2 w-full rounded-lg bg-[var(--brand)] py-1.5 text-xs font-semibold text-white"
              >
                Insert
              </button>
            </div>
          )}
        </div>
        <Divider />

        {/* Undo / Redo */}
        <ToolBtn title="Undo (Ctrl+Z)" onClick={() => exec("undo")}>
          <Undo2 className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Redo (Ctrl+Y)" onClick={() => exec("redo")}>
          <Redo2 className="h-3.5 w-3.5" />
        </ToolBtn>

        {uploading && (
          <span className="ml-2 text-xs text-[var(--brand)]">Uploading…</span>
        )}
      </div>

      {/* ── Editable area ── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="blog-editor min-h-[380px] px-5 py-4 text-sm text-foreground outline-none"
        style={{ lineHeight: 1.8 }}
      />
    </div>
  );
}
