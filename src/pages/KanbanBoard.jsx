import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './KanbanBoard.css';
import axios from 'axios';
import {
  DragDropContext,
  Droppable,
  Draggable,
} from 'react-beautiful-dnd';

// ✅ Connect socket to backend
const socket = io(import.meta.env.VITE_API_BASE_URL);

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Todo');
  const [message, setMessage] = useState('');

  // ✅ Fetch all tasks
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  // ✅ Fetch logs
  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Logs fetched:", res.data);
      setLogs(res.data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  // ✅ Initial load
  useEffect(() => {
    fetchTasks();
    fetchLogs();
  }, [setTasks, setLogs]);

  // ✅ Real-time update using socket
  useEffect(() => {
    socket.on('taskUpdated', () => {
      fetchTasks();
      fetchLogs();
    });

    return () => socket.off('taskUpdated');
  }, []);

  // ✅ Add task
  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/tasks`,
        {
          title,
          description: desc,
          priority,
          status,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTasks((prevTasks) => [...prevTasks, res.data]);
      setMessage('Task Added Successfully ✅');
      setTimeout(() => setMessage(''), 2000);
      setTitle('');
      setDesc('');
      setPriority('Medium');
      setStatus('Todo');
    } catch (err) {
      console.error(err);
      setMessage('❌ Error Adding Task');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  // ✅ Smart Assign
  const handleSmartAssign = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/tasks/${taskId}/smart-assign`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Smart Assigned ✅');
      setTimeout(() => setMessage(''), 2000);
      fetchTasks();
    } catch (err) {
      console.error('Smart Assign Failed:', err);
      setMessage('❌ Smart Assign Failed');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  // ✅ Drag & drop
  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/tasks/${draggableId}`,
        { status: destination.droppableId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchTasks();
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  return (
    <div className="kanban-board-container">
      <h2 style={{ textAlign: 'center' }}>Kanban Board</h2>

      <form className="task-form" onSubmit={handleAddTask}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>Todo</option>
          <option>In Progress</option>
          <option>Done</option>
        </select>
        <button type="submit">Add Task</button>
      </form>

      {message && <p style={{ textAlign: 'center', color: 'green' }}>{message}</p>}

      {/* ✅ Task Columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-container">
          {['Todo', 'In Progress', 'Done'].map((col) => (
            <Droppable droppableId={String(col)} key={col}>
              {(provided) => (
                <div
                  className="kanban-column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h3>{col}</h3>
                  {tasks
                    .filter((task) => task.status === col)
                    .map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            className="task-card"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <h4>{task.title}</h4>
                            <p>{task.description}</p>
                            <p><strong>Priority:</strong> {task.priority}</p>
                            {task.assignedTo && (
                              <p><strong>Assigned to:</strong> {task.assignedTo.name}</p>
                            )}
                            <button
                              className="assign-btn"
                              onClick={() => handleSmartAssign(task._id)}
                            >
                              Smart Assign
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* ✅ Activity Log Panel */}
      <div className="activity-log">
        <h3>📝 Activity Log</h3>
        <ul>
          {logs.map((log, index) => (
            <li key={index}>
              <strong>{log.userId?.name || 'Someone'}</strong> — {log.message}
              <br />
              <small>{new Date(log.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default KanbanBoard;
