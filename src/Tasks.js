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
  const eventID = localStorage.getItem('eventID');
  const currentUser = auth.currentUser;
  const currentUserEmail = currentUser?.email || '';
  const currentUserID = currentUser?.uid || '';
  const currentUserName = currentUser?.displayName || currentUserEmail;

  useEffect(() => {
    const loadData = async () => {
      if (!eventID || !currentUserEmail || !currentUserID) return;

      const event = await fetchEventByID(eventID);
      const loadedTasks = event?.tasks || [];
      const grouped = {};
      loadedTasks.forEach(task => {
        if (!grouped[task.cohostName]) grouped[task.cohostName] = [];
        grouped[task.cohostName].push(task);
      });
      setTasks(grouped);

      const hostID = event?.hostID;
      if (hostID === currentUserID) {
        setIsHost(true);
      }

      const hostName = hostID ? await fetchUserNameByUID(hostID) : 'Host';
      const emailsFromCohosts = event?.cohosts?.map(c => c.email) || [];
      const namesFromCohosts = event?.cohosts?.reduce((acc, cur) => {
        acc[cur.email] = cur.name;
        return acc;
      }, {}) || {};

      const allEmails = [...new Set([...emailsFromCohosts, currentUserEmail])];
      const nameMap = {};

      for (const email of allEmails) {
        const fetchedName = await fetchUserNameByEmail(email);
        nameMap[email] = fetchedName || namesFromCohosts[email] || email;
      }

      if (hostID && hostID !== currentUserID) {
        nameMap['HOST'] = hostName;
      }

      nameMap[currentUserEmail] = currentUserName;
      setUserNames(nameMap);
    };

    loadData();
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, [cohosts]);

  const persistTasksToFirestore = async (newTasks) => {
    const allTasks = [];
    for (const owner in newTasks) {
      newTasks[owner].forEach(task =>
        allTasks.push({ ...task, cohostName: owner })
      );
    }
    await updateEventInFirestore(eventID, { tasks: allTasks });
  };

  const handleAddTask = async (owner, text) => {
    if (!isHost) return;
    const name = userNames[owner] || owner;
    if (!text.trim()) return;

    const newTask = { text, completed: false };
    const updated = {
      ...tasks,
      [name]: [...(tasks[name] || []), newTask],
    };
    setTasks(updated);
    await persistTasksToFirestore(updated);
  };

  const handleDeleteTask = async (name, index) => {
    if (!isHost) return;
    const updated = tasks[name].filter((_, i) => i !== index);
    const newState = { ...tasks, [name]: updated };
    setTasks(newState);
    await persistTasksToFirestore(newState);
  };

  const handleToggleComplete = async (name, index) => {
    const updated = tasks[name].map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    );
    const newState = { ...tasks, [name]: updated };
    setTasks(newState);
    await persistTasksToFirestore(newState);
  };

  const handleEditTask = async (name, index, newText) => {
    if (!isHost) return;
    const updated = tasks[name].map((task, i) =>
      i === index ? { ...task, text: newText } : task
    );
    const newState = { ...tasks, [name]: updated };
    setTasks(newState);
    await persistTasksToFirestore(newState);
  };

  const allTaskOwners = Object.keys(userNames);

  return (
    <div className="container">
      <div className="progress-container">
        <div className="progress-bar" style={{ width: '80%', backgroundColor: '#ffc107' }} />
        <div className="progress-percentage">80%</div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4 position-relative">
        <Link to="/final-result" className="btn back-btn rounded-circle shadow-sm back-icon">
          <i className="bi bi-arrow-left-short"></i>
        </Link>
        <h1 className="position-absolute start-50 translate-middle-x m-0 text-nowrap">Tasks</h1>
      </div>

      <div className='instructions'>
        Hosts assign tasks. Click the box when you complete one.
      </div>

      
      {allTaskOwners.map((owner, idx) => {
        const name = userNames[owner] || owner;
        return (
          <div key={idx} className="category-section bordered-block">
            <h3>{name}'s Tasks</h3>
            {isHost && <TaskInput onAdd={(task) => handleAddTask(owner, task)} />}
            <ul className="task-list">
              {(tasks[name] || []).map((task, i) => (
                <li key={i} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <div className="task-content">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(name, i)}
                    />
                    {isHost ? (
                      <EditableTask
                        text={task.text}
                        onSave={(newText) => handleEditTask(name, i, newText)}
                      />
                    ) : (
                      <span>{task.text}</span>
                    )}
                  </div>
                  {isHost && (
                    <button
                      onClick={() => handleDeleteTask(name, i)}
                      className="remove-button"
                      style={{ marginLeft: '8px' }}
                    >
                      ✕
                    </button>
                  )}
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
