import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CohostContext } from './CohostContext';
import './App.css';
import './Voting.css';

function Tasks() {
  const { cohosts } = useContext(CohostContext);
  const [tasks, setTasks] = useState({}); // { cohostName: [ { text, completed } ] }

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
      <div className='back-button'>
        <Link to="/final-result" className="button-tile">&lt;</Link>
      </div>
      <h2>Tasks</h2>

      {cohosts.map((cohost, idx) => (
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

      <div className="next-button">
        <Link to="/split-budget" className="button-tile">Next</Link>
      </div>
    </div>
  );
}

// Component for adding a new task
function TaskInput({ onAdd }) {
  const [taskText, setTaskText] = useState("");

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onAdd(taskText);
      setTaskText("");
    }
  };

  return (
    <input
      type="text"
      placeholder="Delegate a task"
      value={taskText}
      onChange={(e) => setTaskText(e.target.value)}
      onKeyDown={handleKeyPress}
      className="event-input"
    />
  );
}

// Component for editing task text
function EditableTask({ text, onSave }) {
  const [isEditing, setEditing] = useState(false);
  const [tempText, setTempText] = useState(text);

  const handleBlur = () => {
    onSave(tempText);
    setEditing(false);
  };

  return isEditing ? (
    <input
      type="text"
      value={tempText}
      onChange={e => setTempText(e.target.value)}
      onBlur={handleBlur}
      autoFocus
    />
  ) : (
    <span onDoubleClick={() => setEditing(true)}>{text}</span>
  );
}

export default Tasks;
