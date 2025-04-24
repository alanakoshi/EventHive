// Tasks.js
import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CohostContext } from './CohostContext';
import { auth } from './firebase';
import {
  fetchUserNameByUID,
  fetchEventByID,
  updateEventInFirestore,
} from './firebaseHelpers';
import './App.css';
import './Voting.css';

function Tasks() {
  const { cohosts } = useContext(CohostContext);
  const [tasks, setTasks] = useState({});
  const [hostName, setHostName] = useState('');
  const [owners, setOwners] = useState([]);
  const [isHost, setIsHost] = useState(false);

  const eventID = localStorage.getItem('eventID');
  const currentUserID = auth.currentUser?.uid;

  // Load event, host, cohosts, and tasks
  useEffect(() => {
    if (!eventID) return;

    const loadData = async () => {
      const event = await fetchEventByID(eventID);
      if (!event) return;

      // 1) Host info
      const hostID = event.hostID;
      const fetchedHostName = hostID
        ? await fetchUserNameByUID(hostID)
        : 'Host';
      setHostName(fetchedHostName);
      setIsHost(hostID === currentUserID);

      // 2) Cohost names (from event doc)
      const cohostNames = (event.cohosts || []).map(c => c.name);

      // 3) Build a unique owners list: host first, then cohosts (no dupes)
      const ownersList = [
        fetchedHostName,
        ...cohostNames.filter(n => n !== fetchedHostName),
      ];
      setOwners(ownersList);

      // 4) Group tasks by the display name stored in each task.cohostName
      const loadedTasks = event.tasks || [];
      const grouped = {};
      loadedTasks.forEach(task => {
        if (!grouped[task.cohostName]) grouped[task.cohostName] = [];
        grouped[task.cohostName].push(task);
      });
      setTasks(grouped);
    };

    loadData();
  }, [cohosts, eventID, currentUserID]);

  // Helper to push the in-memory tasks state back to Firestore
  const persistTasks = async newTasks => {
    const flat = [];
    Object.entries(newTasks).forEach(([owner, list]) => {
      list.forEach(task => flat.push({ ...task, cohostName: owner }));
    });
    await updateEventInFirestore(eventID, { tasks: flat });
  };

  // CRUD handlers (add/edit/delete toggles persist immediately)
  const handleAdd = async (owner, text) => {
    if (!isHost || !text.trim()) return;
    const newState = {
      ...tasks,
      [owner]: [...(tasks[owner] || []), { text, completed: false }],
    };
    setTasks(newState);
    await persistTasks(newState);
  };
  const handleDelete = async (owner, i) => {
    if (!isHost) return;
    const newState = {
      ...tasks,
      [owner]: tasks[owner].filter((_, idx) => idx !== i),
    };
    setTasks(newState);
    await persistTasks(newState);
  };
  const handleToggle = async (owner, i) => {
    const newState = {
      ...tasks,
      [owner]: tasks[owner].map((t, idx) =>
        idx === i ? { ...t, completed: !t.completed } : t
      ),
    };
    setTasks(newState);
    await persistTasks(newState);
  };
  const handleEdit = async (owner, i, newText) => {
    if (!isHost || !newText.trim()) return;
    const newState = {
      ...tasks,
      [owner]: tasks[owner].map((t, idx) =>
        idx === i ? { ...t, text: newText } : t
      ),
    };
    setTasks(newState);
    await persistTasks(newState);
  };

  return (
    <div className="container">
      <div className="progress-wrapper">
        <div className="progress-container">
          <div className="progress-bar" style={{ width: '88%' }} />
        </div>
        <div className="progress-percentage">88%</div>
      </div>

      {/* Header + Back Button */}
      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link
          to="/final-result"
          className="btn back-btn rounded-circle shadow-sm back-icon"
        >
          <i className="bi bi-arrow-left-short"></i>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">
          Tasks
        </h1>
      </div>

      {/* Instructions */}
      <div className="instructions">
        {isHost
          ? 'As host, you can assign, edit or delete tasks. Cohosts may only check off completed items.'
          : 'Mark your tasks complete by clicking the checkbox.'}
      </div>

      {/* Task Sections, one per owner */}
      {owners.map((owner, idx) => (
        <div key={idx} className="category-section bordered-block">
          <h3>{owner}&apos;s Tasks</h3>

          {/* Only hosts see the “Delegate a task” input */}
          {isHost && <TaskInput onAdd={text => handleAdd(owner, text)} />}

          <ul className="task-list">
            {(tasks[owner] || []).map((task, i) => (
              <li
                key={i}
                className={`task-item ${task.completed ? 'completed' : ''}`}
              >
                <div className="task-content">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggle(owner, i)}
                  />
                  {isHost ? (
                    <EditableTask
                      text={task.text}
                      onSave={newText => handleEdit(owner, i, newText)}
                    />
                  ) : (
                    <span>{task.text}</span>
                  )}
                </div>

                {/* Only hosts get the delete button */}
                {isHost && (
                  <button
                    onClick={() => handleDelete(owner, i)}
                    className="remove-button"
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Next Button */}
      <div className="next-button-row">
        <Link to="/complete" className="next-button">
          Next
        </Link>
      </div>
    </div>
  );
}

function TaskInput({ onAdd }) {
  const [input, setInput] = useState('');
  const tryAdd = () => {
    if (input.trim()) {
      onAdd(input.trim());
      setInput('');
    }
  };
  return (
    <input
      className="event-input"
      type="text"
      placeholder="Delegate a task"
      value={input}
      onChange={e => setInput(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && tryAdd()}
      onBlur={tryAdd}
    />
  );
}

function EditableTask({ text, onSave }) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(text);

  useEffect(() => setTemp(text), [text]);
  const commit = () => {
    if (temp.trim()) onSave(temp.trim());
    setEditing(false);
  };

  return editing ? (
    <input
      className="event-input"
      type="text"
      value={temp}
      onChange={e => setTemp(e.target.value)}
      onBlur={commit}
      onKeyDown={e => e.key === 'Enter' && commit()}
      autoFocus
    />
  ) : (
    <span className="editable-task" onClick={() => setEditing(true)}>
      {text}
    </span>
  );
}

export default Tasks;
