import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ProjectList from './components/ProjectList';
import TaskBoard from './components/TaskBoard';
import * as api from './api/client';
import './styles.css';

export default function App() {
  const [token, setToken] = useState(null);
  const [view, setView] = useState('login');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    if (token) {
      api.listProjects(token).then(setProjects).catch(console.error);
    }
  }, [token]);

  function logout() {
    setToken(null);
    setProjects([]);
    setSelectedProject(null);
    setView('login');
  }

  if (!token) {
    return view === 'login' ? (
      <Login onLogin={setToken} onSwitch={() => setView('register')} />
    ) : (
      <Register onRegister={setToken} onSwitch={() => setView('login')} />
    );
  }

  return (
    <div className="app">
      <header>
        <h1>TaskFlow</h1>
        <button onClick={logout}>Log out</button>
      </header>
      <div className="layout">
        <ProjectList
          projects={projects}
          selected={selectedProject}
          onSelect={setSelectedProject}
          onCreate={async (name) => {
            const project = await api.createProject(token, { name });
            setProjects((p) => [project, ...p]);
          }}
        />
        {selectedProject ? (
          <TaskBoard token={token} project={selectedProject} />
        ) : (
          <p className="empty-state" style={{ padding: '1.5rem' }}>
            Select or create a project to see its tasks.
          </p>
        )}
      </div>
    </div>
  );
}
