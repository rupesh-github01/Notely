import { useState } from 'react';
import Modal from './Modal';

function Sidebar({ folders, pages, activePageId, setActivePageId, setData, darkMode, setDarkMode }) {
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalConfig, setModalConfig] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addFolder = () => {
    setModalConfig({
      title: 'Add Folder',
      defaultValue: '',
      onSubmit: (name) => {
        if (!name.trim()) return setModalConfig(null);
        const newFolder = { id: Date.now().toString(), name: name.trim() };
        setData(prev => ({
          ...prev,
          folders: [...prev.folders, newFolder]
        }));
        setModalConfig(null);
      },
      onClose: () => setModalConfig(null)
    });
  };

  const renameFolder = (folderId, currentName) => {
    setModalConfig({
      title: 'Rename Folder',
      defaultValue: currentName,
      onSubmit: (newName) => {
        setData(prev => ({
          ...prev,
          folders: prev.folders.map(f => f.id === folderId ? { ...f, name: newName } : f)
        }));
        setModalConfig(null);
      },
      onClose: () => setModalConfig(null)
    });
  };

  const deleteFolder = (folderId) => {
    if (!confirm('Delete this folder and all its pages?')) return;
    setData(prev => ({
      folders: prev.folders.filter(f => f.id !== folderId),
      pages: Object.fromEntries(Object.entries(prev.pages).filter(([_, p]) => p.folderId !== folderId))
    }));
    if (selectedFolderId === folderId) setSelectedFolderId(null);
  };

  const addPage = () => {
    if (!selectedFolderId) {
      alert('Select a folder first.');
      return;
    }
    setModalConfig({
      title: 'Add Page',
      defaultValue: '',
      onSubmit: (title) => {
        if (!title.trim()) return setModalConfig(null);
        const id = Date.now().toString();
        const newPage = {
          id,
          folderId: selectedFolderId,
          title: title.trim(),
          content: '',
          tags: [],
          lastEdited: new Date().toISOString()
        };
        setData(prev => ({
          ...prev,
          pages: {
            ...prev.pages,
            [id]: newPage
          }
        }));
        setActivePageId(id);
        setModalConfig(null);
      },
      onClose: () => setModalConfig(null)
    });
  };

  const renamePage = (pageId, currentTitle) => {
    setModalConfig({
      title: 'Rename Page',
      defaultValue: currentTitle,
      onSubmit: (newTitle) => {
        setData(prev => ({
          ...prev,
          pages: {
            ...prev.pages,
            [pageId]: { ...prev.pages[pageId], title: newTitle }
          }
        }));
        setModalConfig(null);
      },
      onClose: () => setModalConfig(null)
    });
  };

  const deletePage = (pageId) => {
    if (!confirm('Delete this page?')) return;
    setData(prev => {
      const updated = { ...prev.pages };
      delete updated[pageId];
      return { ...prev, pages: updated };
    });
    if (activePageId === pageId) setActivePageId(null);
  };

  const allTags = Array.from(new Set(Object.values(pages).flatMap(p => p.tags || [])));

  // --- Search Suggestions Logic ---
  const searchLower = searchQuery.toLowerCase();
  const pageSuggestions = searchQuery
    ? Object.values(pages)
        .filter(p => p.title.toLowerCase().includes(searchLower))
        .sort((a, b) => a.title.localeCompare(b.title))
    : [];

  const handleSuggestionClick = (pageId) => {
    setActivePageId(pageId);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Notely</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <button onClick={addFolder}>+ Folder</button>
        <button onClick={() => setDarkMode(d => !d)}>
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Search pages..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => searchQuery && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          autoComplete="off"
        />
        {showSuggestions && pageSuggestions.length > 0 && (
          <ul className="search-suggestions">
            {pageSuggestions.map(page => (
              <li
                key={page.id}
                className="suggestion-item"
                onMouseDown={() => handleSuggestionClick(page.id)}
              >
                {page.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      {allTags.length > 0 && (
        <div className="tag-filters">
          {allTags.map(tag => (
            <span
              key={tag}
              className={`tag-chip ${selectedTag === tag ? 'selected' : ''}`}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {folders.map(folder => (
        <div key={folder.id} className="folder-block">
          <div
            className={`folder-title ${folder.id === selectedFolderId ? 'active-folder' : ''}`}
            onClick={() => setSelectedFolderId(folder.id)}
          >
            {folder.name}
            <span style={{ float: 'right' }}>
              <button className="icon-btn" onClick={() => renameFolder(folder.id, folder.name)} aria-label="Rename Folder">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M4 13.5V16h2.5l7.06-7.06-2.5-2.5L4 13.5zM17.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.13 1.13 3.75 3.75 1.13-1.13z" fill="#0077b6"/></svg>
              </button>
              <button className="icon-btn" onClick={() => deleteFolder(folder.id)} aria-label="Delete Folder">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M6 7v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V7M9 10v3M11 10v3M4 7h12M8 4h4a1 1 0 0 1 1 1v1H7V5a1 1 0 0 1 1-1z" stroke="#0077b6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </span>
          </div>

          {folder.id === selectedFolderId && (
            <>
              <button className="small-btn" onClick={addPage}>Add Page</button>
              <ul className="page-list">
                {Object.values(pages)
                  .filter(p =>
                    p.folderId === folder.id &&
                    p.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    (!selectedTag || p.tags?.includes(selectedTag))
                  )
                  .map(page => (
                    <li
                      key={page.id}
                      className={`page-item ${page.id === activePageId ? 'active-page' : ''}`}
                      onClick={() => setActivePageId(page.id)}
                    >
                      {page.title}
                      <span style={{ float: 'right' }}>
                        <button className="icon-btn" onClick={(e) => { e.stopPropagation(); renamePage(page.id, page.title); }} aria-label="Rename Page">
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M4 13.5V16h2.5l7.06-7.06-2.5-2.5L4 13.5zM17.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.13 1.13 3.75 3.75 1.13-1.13z" fill="#0077b6"/></svg>
                        </button>
                        <button className="icon-btn" onClick={(e) => { e.stopPropagation(); deletePage(page.id); }} aria-label="Delete Page">
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M6 7v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V7M9 10v3M11 10v3M4 7h12M8 4h4a1 1 0 0 1 1 1v1H7V5a1 1 0 0 1 1-1z" stroke="#0077b6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </span>
                    </li>
                  ))}
              </ul>
            </>
          )}
        </div>
      ))}

      {modalConfig && (
        <Modal
          title={modalConfig.title}
          defaultValue={modalConfig.defaultValue}
          onSubmit={modalConfig.onSubmit}
          onClose={modalConfig.onClose}
        />
      )}
    </div>
  );
}

export default Sidebar;
