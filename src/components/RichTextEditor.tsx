import React, { useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Palette,
  Eraser,
  Code
} from 'lucide-react';

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Write content here...',
  minHeight = 'min-h-[180px]'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInsertLink = () => {
    const url = prompt('Enter link URL (e.g. https://example.com):');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const handleInsertImage = () => {
    const url = prompt('Enter Image URL (e.g. https://images.unsplash.com/...):');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const handleInsertTable = () => {
    const rows = prompt('Number of rows:', '2');
    const cols = prompt('Number of columns:', '2');
    if (rows && cols) {
      let tableHtml = '<table class="border-collapse border border-slate-300 dark:border-slate-700 my-2 w-full text-xs"><tbody>';
      for (let r = 0; r < parseInt(rows); r++) {
        tableHtml += '<tr>';
        for (let c = 0; c < parseInt(cols); c++) {
          tableHtml += '<td class="border border-slate-300 dark:border-slate-700 p-2">Cell</td>';
        }
        tableHtml += '</tr>';
      }
      tableHtml += '</tbody></table>';
      execCommand('insertHTML', tableHtml);
    }
  };

  const handleHeading = (headingTag: string) => {
    execCommand('formatBlock', `<${headingTag}>`);
  };

  const handleTextColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    execCommand('foreColor', e.target.value);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      <div className="border border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
        {/* Formatting Toolbar */}
        <div className="p-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-1 text-slate-700 dark:text-slate-300">
          <button
            type="button"
            onClick={() => execCommand('bold')}
            title="Bold"
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-xs transition-colors cursor-pointer"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => execCommand('italic')}
            title="Italic"
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-xs transition-colors cursor-pointer"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => execCommand('underline')}
            title="Underline"
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-xs transition-colors cursor-pointer"
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          <button
            type="button"
            onClick={() => handleHeading('h2')}
            title="Heading 2"
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-0.5"
          >
            <Heading1 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleHeading('h3')}
            title="Heading 3"
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-0.5"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleHeading('p')}
            title="Paragraph"
            className="px-2 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
          >
            Normal Text
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          <button
            type="button"
            onClick={() => execCommand('insertUnorderedList')}
            title="Bullet List"
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-xs transition-colors cursor-pointer"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => execCommand('insertOrderedList')}
            title="Numbered List"
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-xs transition-colors cursor-pointer"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          <button
            type="button"
            onClick={handleInsertLink}
            title="Insert Hyperlink"
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-xs transition-colors cursor-pointer"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleInsertImage}
            title="Insert Image"
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-xs transition-colors cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleInsertTable}
            title="Insert Table"
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-xs transition-colors cursor-pointer"
          >
            <TableIcon className="w-4 h-4" />
          </button>

          <label className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-xs transition-colors cursor-pointer relative flex items-center" title="Text Color">
            <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <input
              type="color"
              onChange={handleTextColor}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          <button
            type="button"
            onClick={() => execCommand('removeFormat')}
            title="Clear Formatting"
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-xs transition-colors cursor-pointer text-red-500"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* Editable Canvas */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          dangerouslySetInnerHTML={{ __html: value }}
          className={`p-4 text-xs text-slate-800 dark:text-slate-100 focus:outline-none leading-relaxed overflow-y-auto ${minHeight}`}
          data-placeholder={placeholder}
        />
      </div>
    </div>
  );
};
