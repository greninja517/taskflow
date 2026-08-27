import { useState } from 'react';

export default function ProjectList({ projects, selected, onSelect, onCreate }) {
  const [name, setName] = useState('');

  return (
    <aside className="project-list">
      <h2>Projects</h2>
      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            <button className={selected?.id === p.id ? 'active' : ''} onClick={() => onSelect(p)}>
              {p.name}
            </button>
          </li>
        ))}
        {projects.length === 0 && <li className="empty-state">No projects yet</li>}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onCreate(name.trim());
          setName('');
        }}
      >
        <input
          aria-label="new-project-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project"
        />
        <button type="submit">Add</button>
      </form>
    </aside>
  );
}
