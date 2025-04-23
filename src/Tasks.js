import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CohostContext } from './CohostContext';
import { auth } from './firebase';
import {
  fetchUserNameByEmail,
  fetchUserNameByUID,
  fetchEventByID,
  updateEventInFirestore,
} from './firebaseHelpers';
import './App.css';
import './Voting.css';

function Tasks() {
  const { cohosts } = useContext(CohostContext);
  const [tasks, setTasks] = useState({});
  const [userNames, setUserNames] = useState({});
  const [isHost, setIsHost] = useState(false);
  const [hostID, setHostID] = useState(null);
  const eventID = localStorage.getItem('eventID');
  const currentUser = auth.currentUser;
  const currentUserEmail = currentUser?.email || '';
  const currentUserID = currentUser?.uid || '';
  const currentUserName = currentUser?.displayName || currentUserEmail;

  useEffect(() => {
    let interval;
    const loadData = async () => {
      if (!eventID) return;
      const event = await fetchEventByID(eventID);
      if (!event) return;
      const { tasks: loadedTasks = [], hostID: fetchedHostID, cohosts: eventCohosts = [] } = event;
      setHostID(fetchedHostID);
      setIsHost(fetchedHostID === currentUserID);

      // Group tasks by cohostName (key)
      const grouped = {};
      loadedTasks.forEach(t => {
        const key = t.cohostName;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push({ text: t.text, completed: t.completed });
      });
      setTasks(grouped);

      // Map each key to a display name
      const nameMap = {};
      Object.keys(grouped).forEach(key => {
        if (key === currentUserEmail) {
          nameMap[key] = currentUserName;
        } else {
          const co = eventCohosts.find(c => c.email === key);
          nameMap[key] = co ? co.name : key;
        }
      });
      setUserNames(nameMap);
    };

    loadData();
    interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, [cohosts, eventID, currentUserEmail, currentUserID, currentUserName]);

  // Owners list: host first (by email), then others
  const owners = Object.keys(userNames).sort((a, b) => {
    if (a === currentUserEmail) return -1;
    if (b === currentUserEmail) return 1;
    return 0;
  });

  const persistTasks = async (newTasks) => {
    const all = [];
    Object.entries(newTasks).forEach(([key, arr]) => {
      arr.forEach(t => all.push({ ...t, cohostName: key }));
    });
    await updateEventInFirestore(eventID, { tasks: all });
  };

  const handleAddTask = async (ownerKey, text) => {
    if (!isHost || !text.trim()) return;
    const updated = { ...tasks };
    updated[ownerKey] = [...(updated[ownerKey] || []), { text, completed: false }];
    setTasks(updated);
    await persistTasks(updated);
  };

  const handleDeleteTask = async (ownerKey, idx) => {
    if (!isHost) return;
    const updated = { ...tasks };
    updated[ownerKey] = updated[ownerKey].filter((_, i) => i !== idx);
    setTasks(updated);
    await persistTasks(updated);
  };

  const handleToggleComplete = async (ownerKey, idx) => {
    const updated = { ...tasks };
    updated[ownerKey] = updated[ownerKey].map((t, i) =>
      i === idx ? { ...t, completed: !t.completed } : t
    );
    setTasks(updated);
    await persistTasks(updated);
  };

  const handleEditTask = async (ownerKey, idx, newText) => {
    if (!isHost || !newText.trim()) return;
    const updated = { ...tasks };
    updated[ownerKey] = updated[ownerKey].map((t, i) =>
      i === idx ? { ...t, text: newText } : t
    );
    setTasks(updated);
    await persistTasks(updated);
  };

  return (
    <div className="container">
      <div className="progress-wrapper">
        <div className="progress-container">
          <div className="progress-bar" style={{ width: '80%' }} />
        </div>
        <div className="progress-percentage">80%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/final-result" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"></i>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Tasks</h1>
      </div>

      <div className="instructions">Hosts assign tasks. Click when complete.</div>

      {owners.map((key, idx) => (
        <div key={idx} className="category-section bordered-block">
          <h3>{userNames[key]}'s Tasks</h3>
          {isHost && <TaskInput onAdd={(t) => handleAddTask(key, t)} />}
          <ul className="task-list">
            {(tasks[key] || []).map((task, i) => (
              <li key={i} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <div className="task-content">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(key, i)}
                  />
                  {isHost ? (
                    <EditableTask text={task.text} onSave={(nt) => handleEditTask(key, i, nt)} />
                  ) : (
                    <span className="non-editable">{task.text}</span>
                  )}
                </div>
                {isHost && (
                  <button onClick={() => handleDeleteTask(key, i)} className="remove-button">✕</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="next-button-row">
        <Link to="/complete" className="next-button">Next</Link>
      </div>
    </div>
  );
}

function TaskInput({ onAdd }) {
  const [taskText, setTaskText] = useState('');
  const tryAdd = () => {
    const t = taskText.trim();
    if (t) {
      onAdd(t);
      setTaskText('');
    }
  };
  return (
    <input
      type="text"
      placeholder="Delegate a task"
      className="event-input"
      value={taskText}
      onChange={(e) => setTaskText(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && tryAdd()}
      onBlur={tryAdd}
    />
  );
}

function EditableTask({ text, onSave }) {
  const [editing, setEditing] = useState(false);
  const [tempText, setTempText] = useState(text);
  useEffect(() => setTempText(text), [text]);
  const commit = () => {
    const t = tempText.trim();
    setTimeout(() => {
      if (t) onSave(t);
      else setTempText(text);
      setEditing(false);
    }, 0);
  };
  return editing ? (
    <input
      type="text"
      className="event-input"
      value={tempText}
      onChange={(e) => setTempText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && commit()}
      autoFocus
    />
  ) : (
    <span onClick={() => setEditing(true)} className="editable-task">
      {text}
    </span>
  );
}

export default Tasks;