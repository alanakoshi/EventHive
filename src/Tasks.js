import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CohostContext } from './CohostContext';
import { auth } from './firebase';
import {
  addTaskToFirestore,
  fetchTasksForEvent,
  fetchUserNameByEmail
} from './firebaseHelpers';
import './App.css';
import './Voting.css';

function Tasks() {
  const { cohosts } = useContext(CohostContext);
  const [tasks, setTasks] = useState({});
  const [cohostNames, setCohostNames] = useState({});
  const eventID = localStorage.getItem('eventID');
  const currentUserEmail = auth.currentUser?.email;
  const currentUserName = auth.currentUser?.displayName || currentUserEmail;

  useEffect(() => {
    const loadData = async () => {
      const loadedTasks = await fetchTasksForEvent(eventID);
      const groupedTasks = {};
      loadedTasks.forEach((task) => {
        if (!groupedTasks[task.cohostName]) {
          groupedTasks[task.cohostName] = [];
        }
        groupedTasks[task.cohostName].push(task);
      });
      setTasks(groupedTasks);

      const allEmails = [...new Set([...cohosts.map(c => c.email), currentUserEmail])];
      const nameMap = {};

      for (const email of allEmails) {
        const name = await fetchUserNameByEmail(email);
        nameMap[email] = name || email;
      }

      const currentUserNameFromDB = await fetchUserNameByEmail(currentUserEmail);
      nameMap[currentUserEmail] = currentUserNameFromDB || currentUserName;

      setCohostNames(nameMap);
    };

    loadData();
  }, [cohosts, eventID, currentUserEmail, currentUserName]);

  const allCohosts = [
    ...new Set([...cohosts.map(c => c.email), currentUserEmail])
  ];

  const handleAddTask = async (email, text) => {
    const name = cohostNames[email] || email;
    if (!text.trim()) return;

    await addTaskToFirestore(eventID, name, text);
    const newTask = { text, completed: false };

    setTasks((prev) => ({
      ...prev,
      [name]: [...(prev[name] || []), newTask]
    }));
  };

  const handleDeleteTask = (name, index) => {
    const updated = tasks[name].filter((_, i) => i !== index);
    setTasks((prev) => ({ ...prev, [name]: updated }));
  };

  const handleToggleComplete = (name, index) => {
    const updated = tasks[name].map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    );
    setTasks((prev) => ({ ...prev, [name]: updated }));
  };

  const handleEditTask = (name, index, newText) => {
    const updated = tasks[name].map((task, i) =>
      i === index ? { ...task, text: newText } : task
    );
    setTasks((prev) => ({ ...prev, [name]: updated }));
  };

  return (
    <div className="container">
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '80%' }} />
        <div className="progress-percentage">80%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/final-result" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"></i>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Tasks</h1>
      </div>

      {allCohosts.map((email, idx) => {
        const name = cohostNames[email] || email;
        return (
          <div key={idx} className="color-block">
            <h3>{name}'s Tasks</h3>
            <TaskInput onAdd={(task) => handleAddTask(email, task)} />
            <ul>
              {(tasks[name] || []).map((task, i) => (
                <li key={i} className={task.completed ? 'completed' : ''}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(name, i)}
                  />
                  <EditableTask
                    text={task.text}
                    onSave={(newText) => handleEditTask(name, i, newText)}
                  />
                  <button onClick={() => handleDeleteTask(name, i)}>x</button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <div className="next-button-row">
        <Link to="/complete" className="next-button">
          Next
        </Link>
      </div>
    </div>
  );
}

function TaskInput({ onAdd }) {
  const [taskText, setTaskText] = useState('');

  const tryAdd = () => {
    const trimmed = taskText.trim();
    if (trimmed !== '') {
      onAdd(trimmed);
      setTaskText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') tryAdd();
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

function EditableTask({ text, onSave }) {
  const [isEditing, setEditing] = useState(false);
  const [tempText, setTempText] = useState(text);

  useEffect(() => {
    setTempText(text);
  }, [text]);

  const commitEdit = () => {
    const trimmed = tempText.trim();
    setTimeout(() => {
      if (trimmed !== '') {
        onSave(trimmed);
      } else {
        setTempText(text);
      }
      setEditing(false);
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
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
