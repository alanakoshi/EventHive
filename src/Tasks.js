// Tasks.js
import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CohostContext } from './CohostContext';
import { auth } from './firebase';
import {
  addTaskToFirestore,
  fetchTasksForEvent,
  fetchUserNameByEmail,
  fetchUserNameByUID,
  fetchEventByID,
} from './firebaseHelpers';
import './App.css';
import './Voting.css';

function Tasks() {
  const { cohosts } = useContext(CohostContext);
  const [tasks, setTasks] = useState({});
  const [userNames, setUserNames] = useState({});
  const eventID = localStorage.getItem('eventID');
  const currentUserEmail = auth.currentUser?.email;
  const currentUserID = auth.currentUser?.uid;
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

      const event = await fetchEventByID(eventID);
      const hostID = event?.hostID;
      const hostName = hostID ? await fetchUserNameByUID(hostID) : 'Host';

      const emails = [...new Set([...cohosts.map(c => c.email), currentUserEmail])];
      const nameMap = {};

      for (const email of emails) {
        const name = await fetchUserNameByEmail(email);
        nameMap[email] = name || email;
      }

      // Set host name only if current user is NOT the host
      if (hostID !== currentUserID) {
        nameMap['HOST'] = hostName;
      }

      nameMap[currentUserEmail] = currentUserName;
      setUserNames(nameMap);
    };

    loadData();
  }, [cohosts, eventID, currentUserEmail, currentUserName, currentUserID]);

  const allTaskOwners =
    'HOST' in userNames
      ? ['HOST', ...new Set([...cohosts.map(c => c.email), currentUserEmail])]
      : [...new Set([...cohosts.map(c => c.email), currentUserEmail])];

  const handleAddTask = async (owner, text) => {
    const name = userNames[owner] || owner;
    if (!text.trim()) return;

    await addTaskToFirestore(eventID, name, text);
    const newTask = { text, completed: false };

    setTasks((prev) => ({
      ...prev,
      [name]: [...(prev[name] || []), newTask],
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

      {allTaskOwners.map((owner, idx) => {
        const name = userNames[owner] || owner;
        return (
          <div key={idx} className="color-block">
            <h3>{name}'s Tasks</h3>
            <TaskInput onAdd={(task) => handleAddTask(owner, task)} />
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
  return (
    <input
      type="text"
      placeholder="Delegate a task"
      value={taskText}
      onChange={(e) => setTaskText(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && tryAdd()}
      onBlur={tryAdd}
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

  return isEditing ? (
    <input
      type="text"
      value={tempText}
      onChange={(e) => setTempText(e.target.value)}
      onBlur={commitEdit}
      onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
      autoFocus
    />
  ) : (
    <span onClick={() => setEditing(true)} className="editable-task">
      {text}
    </span>
  );
}

export default Tasks;
