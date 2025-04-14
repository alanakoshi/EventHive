import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { CohostContext } from './CohostContext';
import './App.css';
import './Voting.css';

function Tasks() {
  const { cohosts } = useContext(CohostContext);
  const [tasks, setTasks] = useState({}); // { cohostName: [ { text, completed } ] }
  
  // State for the current user's name
  const [myName, setMyName] = useState('');

  // Listen for authentication state changes to get the current user's name
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setMyName(user.displayName || user.email || '');
      } else {
        setMyName('');
      }
    });
    return () => unsubscribe();
  }, []);

  // Merge the current user's name with the cohosts.
  // If no cohosts exist, default to just your name.
  // If cohosts exist and your name is not included, add it.
  const allCohosts = myName
    ? (cohosts.length === 0 ? [myName] : (cohosts.includes(myName) ? cohosts : [myName, ...cohosts]))
    : cohosts;

  const handleAddTask = (cohost, taskText) => {
    if (!taskText.trim()) return;
    const newTask = { text: taskText, completed: false };
    setTasks(prev => ({
      ...prev,
      [cohost]: [...(prev[cohost] || []), newTask],
    }));
  };

  const handleDeleteTask = (cohost, index) => {
    const updated = tasks[cohost].filter((_, i) => i !== index);
    setTasks(prev => ({ ...prev, [cohost]: updated }));
  };

  const handleToggleComplete = (cohost, index) => {
    const updated = tasks[cohost].map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    );
    setTasks(prev => ({ ...prev, [cohost]: updated }));
  };

  const handleEditTask = (cohost, index, newText) => {
    const updated = tasks[cohost].map((task, i) =>
      i === index ? { ...task, text: newText } : task
    );
    setTasks(prev => ({ ...prev, [cohost]: updated }));
  };

  return (
    <div className="container">
      {/* Progress bar section */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '80%' }} />
        <div className="progress-percentage">80%</div>
      </div>
      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        {/* Back button aligned left */}
        <Link to="/final-result" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"></i>
        </Link>
        {/* Centered title */}
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Tasks</h1>
      </div>

      {allCohosts.map((cohost, idx) => (
        <div key={idx} className="color-block">
          <h3>{cohost}'s Tasks</h3>
          <TaskInput onAdd={task => handleAddTask(cohost, task)} />
          <ul>
            {(tasks[cohost] || []).map((task, i) => (
              <li key={i} className={task.completed ? "completed" : ""}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleComplete(cohost, i)}
                />
                <EditableTask
                  text={task.text}
                  onSave={newText => handleEditTask(cohost, i, newText)}
                />
                <button onClick={() => handleDeleteTask(cohost, i)}>x</button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Next button */}
      <div className="next-button-row">
        <Link to="/split-budget" className="next-button">
          Next
        </Link>
      </div>
    </div>
  );
}

// Component for adding a new task
function TaskInput({ onAdd }) {
  const [taskText, setTaskText] = useState("");

  const tryAdd = () => {
    const trimmed = taskText.trim();
    if (trimmed !== "") {
      onAdd(trimmed);
      setTaskText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      tryAdd();
    }
  };

  const handleBlur = () => {
    tryAdd();
  };

  return (
    <input
      type="text"
      placeholder="Delegate a task"
      value={taskText}
      onChange={(e) => setTaskText(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className="event-input"
    />
  );
}


// Component for editing task text
function EditableTask({ text, onSave }) {
  const [isEditing, setEditing] = useState(false);
  const [tempText, setTempText] = useState(text);

  useEffect(() => {
    setTempText(text);
  }, [text]);

  const commitEdit = () => {
    const trimmed = tempText.trim();
    setTimeout(() => {
      if (trimmed !== "") {
        onSave(trimmed);
      } else {
        setTempText(text); // restore if blank
      }
      setEditing(false);
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      commitEdit();
    } else if (e.key === "Escape") {
      setTempText(text);
      setEditing(false);
    }
  };

  return isEditing ? (
    <input
      type="text"
      value={tempText}
      onChange={(e) => setTempText(e.target.value)}
      onBlur={commitEdit}
      onKeyDown={handleKeyDown}
      autoFocus
    />
  ) : (
    <span onClick={() => setEditing(true)} className="editable-task">
      {text}
    </span>
  );
}

export default Tasks;
