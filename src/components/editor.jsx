import { useEffect, useState, useRef } from 'react';
import { Page, Text, Document, StyleSheet, pdf } from '@react-pdf/renderer';

function Editor({ page, updatePage }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false });
  const editorRef = useRef(null);
  const prevPageId = useRef(null);

  // Only set content when switching to a different page
  useEffect(() => {
    if (page && page.id !== prevPageId.current) {
      setTitle(page.title || '');
      setContent(page.content || '');
      setTags((page.tags || []).join(', '));
      setActiveTags(page.tags || []);
      if (editorRef.current) {
        editorRef.current.innerHTML = page.content || '';
      }
      prevPageId.current = page.id;
    }
  }, [page]);

  // Save content to state for persistence, but don't control the DOM after initial load
  const handleEditorInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      updateActiveFormats();
    }
  };

  // Update active format state on selection change
  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline')
    });
  };

  useEffect(() => {
    document.addEventListener('selectionchange', updateActiveFormats);
    return () => document.removeEventListener('selectionchange', updateActiveFormats);
  }, []);

  useEffect(() => {
    if (page) {
      const timeout = setTimeout(() => {
        updatePage({
          ...page,
          title,
          content,
          tags: activeTags,
          lastEdited: new Date().toISOString()
        });
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [title, content, activeTags]);

  const applyFormat = (command) => {
    editorRef.current.focus();
    document.execCommand(command, false, null);
    setContent(editorRef.current.innerHTML);
    updateActiveFormats();
  };

  const handleTagInput = (e) => {
    const value = e.target.value;
    setTags(value);

    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = value.trim().replace(/,/g, '');
      if (newTag && !activeTags.includes(newTag)) {
        setActiveTags([...activeTags, newTag]);
        setTags('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setActiveTags(activeTags.filter(tag => tag !== tagToRemove));
  };

  const exportPDF = async () => {
    const blob = await pdf(
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>{title}</Text>
          <Text>{content}</Text>
        </Page>
      </Document>
    ).toBlob();

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title || 'note'}.pdf`;
    link.click();
  };

  if (!page) {
    return (
      <div className="editor">
        <p style={{ color: '#aaa' }}>Select or create a page to begin writing.</p>
      </div>
    );
  }

  return (
    <div className="editor">
      <input
        type="text"
        className="editor-title premium-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Page title"
      />
      <div className="premium-separator"></div>
      <div className="editor-toolbar">
        <button
          type="button"
          className={`format-btn${activeFormats.bold ? ' active' : ''}`}
          title="Bold"
          onMouseDown={e => e.preventDefault()}
          onClick={() => applyFormat('bold')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
            <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
          </svg>
        </button>
        <button
          type="button"
          className={`format-btn${activeFormats.italic ? ' active' : ''}`}
          title="Italic"
          onMouseDown={e => e.preventDefault()}
          onClick={() => applyFormat('italic')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="4" x2="10" y2="4"></line>
            <line x1="14" y1="20" x2="5" y2="20"></line>
            <line x1="15" y1="4" x2="9" y2="20"></line>
          </svg>
        </button>
        <button
          type="button"
          className={`format-btn${activeFormats.underline ? ' active' : ''}`}
          title="Underline"
          onMouseDown={e => e.preventDefault()}
          onClick={() => applyFormat('underline')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
            <line x1="4" y1="21" x2="20" y2="21"></line>
          </svg>
        </button>
      </div>
      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        onInput={handleEditorInput}
        suppressContentEditableWarning
        spellCheck={true}
        style={{ direction: 'ltr', textAlign: 'left' }}
      />
      <div className="tags-container">
        <div className="active-tags">
          {activeTags.map(tag => (
            <span key={tag} className="tag">
              {tag}
              <button className="tag-remove" onClick={() => removeTag(tag)}>×</button>
            </span>
          ))}
        </div>
        <input
          type="text"
          className="tag-input"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          onKeyDown={handleTagInput}
          placeholder="Add tags (press Enter or comma)"
        />
      </div>
      <button className="fab-export" onClick={exportPDF} title="Export to PDF">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#0077b6"/><path d="M12 7v7m0 0l-3-3m3 3l3-3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="6" y="17" width="12" height="2" rx="1" fill="#fff"/></svg>
      </button>
    </div>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12
  },
  title: {
    fontSize: 18,
    marginBottom: 10
  }
});

export default Editor;
