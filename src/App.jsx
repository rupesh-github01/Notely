import { useEffect, useState } from 'react';
import './styles/app.css';
import Sidebar from './components/Sidebar'
import Editor from './components/Editor';
import Modal from './components/Modal';
import { loadData, saveData } from './utils/storage';

function App() {
  const [data, setData] = useState(() => loadData());
  const [activePageId, setActivePageId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const updatePage = (updatedPage) => {
    setData(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [updatedPage.id]: updatedPage
      }
    }));
  };

  return (
    <div className="container">
      <Sidebar
        folders={data.folders}
        pages={data.pages}
        activePageId={activePageId}
        setActivePageId={setActivePageId}
        setData={setData}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      <div className="content">
        <Editor
          page={data.pages[activePageId]}
          updatePage={updatePage}
        />
      </div>
    </div>
  );
}

export default App;
