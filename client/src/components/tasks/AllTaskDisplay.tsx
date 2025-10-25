import axios from 'axios';
import React, { useState, useEffect } from 'react';
import InfoPopup from '../popups/InfoPopup';
import ErrorPopup from '../popups/ErrorPopup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TASK } from '@/common/messages';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

const AllTaskDisplay: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({ title: '', description: '', isCompleted: false });

  const [error, setError] = useState<string[]>([]);
  const [isError, setIsError] = useState<boolean>(false);

  const startEditing = (task: any) => {
    setEditingTaskId(task.id);
    setEditValues({ title: task.title, description: task.description, isCompleted: false });
  };

  // handle cancel edit button click
  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditValues({ title: '', description: '', isCompleted: false });
  };

  const saveEditing = (taskId: number) => {
    handleUpdate(taskId, editValues);
    cancelEditing();
  };

  const handleUpdate = async (taskId: number, updatedTask: any) => {
    try {
      const taskData = {
        id: taskId,
        title: updatedTask.title,
        description: updatedTask.description,
        isCompleted: updatedTask.isCompleted,
      };

      const response = await api.put('/api/v1/task', taskData);
      if (response.data.success) {
        // update task in state
        setTasks((prevTasks) => prevTasks.map((t) => (t.id === taskId ? { ...t, ...updatedTask } : t)));

        openInfoPopup(TASK.UPDATED);
        cancelEditing();
      }
    } catch (error) {
      openErrorPopup(TASK.UPDATE_FAILED);
    }
  };

  // handle complete
  const handleComplete = async (task: any) => {
    try {
      const taskData = {
        id: task.id,
        title: task.title,
        description: task.description,
        isCompleted: true,
      };

      const response = await api.put('/api/v1/task', taskData);
      if (response.data.success) {
        // remove completed task
        setTasks((prevTasks) => prevTasks.filter((t) => t.id !== task.id));

        openInfoPopup(TASK.COMPLETED);
      }
    } catch (error: any) {
      openErrorPopup(TASK.COMPLETE_FAILED);
    }
  };

  // handle delete button click
  const handleDelete = async (taskId: number) => {
    try {
      const res = await api.delete(`/api/v1/task/${taskId}`);

      if (res.status === 200 || res.status === 204) {
        // remove deleted task
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

        openInfoPopup(TASK.DELETED);
      }
    } catch (error: any) {
      openErrorPopup(TASK.DELETE_FAILED);
      setError([error.message || TASK.DELETE_FAILED]);
    }
  };

  // get tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);

      const { data } = await api.get('/api/v1/task');
      const response = data;

      if (response.success) {
        setTasks(response.response.data.tasks);
      } else {
        setError([response.response.data.message || TASK.FETCH_FAILED]);
      }
    } catch (error: any) {
      setError([error.message || TASK.FETCH_FAILED]);
    } finally {
      setLoading(false);
    }
  };

  // open info popup
  const openInfoPopup = (message: string) => {
    setInfoMessage(null);
    setTimeout(() => {
      setInfoMessage(message);
    }, 10); // delay to updates the state
  };

  // open error popup
  const openErrorPopup = (message: string) => {
    setErrorMessage(null);
    setTimeout(() => {
      setErrorMessage(message);
    }, 10); // delay to updates the state
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // handle error timeout
  useEffect(() => {
    if (isError) {
      const timer = setTimeout(() => {
        setIsError(false);
        setError([]);
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isError]);

  return (
    <div className="flex flex-col gap-3 overflow-auto h-full pr-2 pt-1 md:pt-7 pb-1 md:pb-7">
      {isError &&
        error.map((msg, idx) => (
          <div key={idx} className="w-full py-2 bg-red-500 text-white rounded-md text-sm text-center">
            {msg}
          </div>
        ))}

      {tasks.length === 0 ? (
        <div className="flex items-center justify-center w-full h-full">
          <p className="text-center text-gray-500 italic">No tasks available</p>
        </div>
      ) : (
        // task display container
        <div className="flex flex-col gap-3 overflow-auto h-full pr-2 pt-1 md:pt-7 pb-1 md:pb-7">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`w-full border rounded-lg p-4 shadow-sm flex flex-col ${
                task.isCompleted
                  ? 'bg-teal-200/50 border-teal-300'
                  : editingTaskId === task.id
                  ? 'bg-blue-200/50 border-blue-300'
                  : 'bg-gray-200/50 border-gray-300'
              }`}
            >
              {/* task details with editable fields */}
              {editingTaskId === task.id ? (
                <div className="flex flex-col gap-2 mb-2">
                  <Input
                    type="text"
                    value={editValues.title}
                    onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                    className="text-lg md:text-xl font-semibold rounded-lg p-1 border-gray-400 bg-white"
                  />
                  <Textarea
                    value={editValues.description}
                    onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                    className="text-sm md:text-base p-1 rounded-lg resize-none border-gray-400 bg-white"
                  />
                </div>
              ) : (
                <>
                  <h3 className="text-lg md:text-xl font-semibold leading-snug mb-1">{task.title}</h3>
                  <p className="text-gray-700 text-sm md:text-base leading-snug mb-2">{task.description}</p>
                </>
              )}

              <hr className="border-gray-300 mb-2" />

              {/* task status and action buttons */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex flex-col w-full md:w-1/2">
                  <p className="text-sm md:text-sm text-gray-500 leading-snug mb-1">
                    Status: <span className="text-black font-semibold">{task.isCompleted ? 'Completed' : 'Pending'}</span>
                  </p>
                  <p className="text-xs md:text-sm text-gray-400 leading-snug">Created on: {new Date(task.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex gap-2 w-full md:w-1/2">
                  {task.isCompleted ? (
                    // only show delete button if task is completed
                    <div className="flex justify-end w-full">
                      <Button
                        onClick={() => handleDelete(task.id)}
                        className="w-1/3 px-0 py-1 text-xs md:text-sm bg-red-600 text-white rounded-md hover:bg-red-800 cursor-pointer text-center"
                      >
                        Delete
                      </Button>
                    </div>
                  ) : editingTaskId === task.id ? (
                    // show save | cancel buttons on edit
                    <div className="flex justify-end w-full gap-2">
                      <Button
                        onClick={() => saveEditing(task.id)}
                        className="w-1/3 px-0 py-1 text-xs md:text-sm bg-green-600 text-white rounded-md hover:bg-green-800 cursor-pointer text-center"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={cancelEditing}
                        className="w-1/3 px-0 py-1 text-xs md:text-sm bg-red-600 text-white rounded-md hover:bg-red-800 cursor-pointer text-center"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    // show edit | complete | delete by default
                    <>
                      <Button
                        onClick={() => startEditing(task)}
                        className="flex-1 px-0 py-1 text-xs md:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-800 cursor-pointer text-center"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleComplete(task)}
                        className="flex-1 px-0 py-1 text-xs md:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer text-center"
                      >
                        Complete
                      </Button>
                      <Button
                        onClick={() => handleDelete(task.id)}
                        className="flex-1 px-0 py-1 text-xs md:text-sm bg-red-600 text-white rounded-md hover:bg-red-800 cursor-pointer text-center"
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* popups */}
      {infoMessage && <InfoPopup message={infoMessage} />}
      {errorMessage && <ErrorPopup message={errorMessage} />}
    </div>
  );
};

export default AllTaskDisplay;
