import axios from 'axios';
import React, { useState, useEffect } from 'react';
import InfoPopup from '../popups/InfoPopup';
import { Button } from '@/components/ui/button';
import { INFO, TASK } from '@/common/messages';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

const AllTaskDisplay: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const [error, setError] = useState<string[]>([]);
  const [isError, setIsError] = useState<boolean>(false);

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
      openInfoPopup(TASK.DELETE_FAILED);
      setError([error.message || 'Failed to delete the task']);
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
    <div className="flex flex-col gap-4 w-full h-full">
      {isError &&
        error.map((msg, idx) => (
          <div key={idx} className="w-full py-2 bg-red-500 text-white rounded-md text-sm text-center">
            {msg}
          </div>
        ))}

      {tasks.length === 0 ? (
        <p className="text-center text-gray-500 mt-2">No tasks available</p>
      ) : (
        // tas display container
        <div className="flex flex-col gap-3 overflow-auto h-full pr-2 pt-1 md:pt-7 pb-1 md:pb-7">
          {tasks.map((task) => (
            // task box
            <div
              key={task.id}
              className={`w-full border  rounded-lg p-4 shadow-sm flex flex-col ${
                task.isCompleted ? 'bg-green-200/70 border-green-300' : 'bg-gray-200/50 border-gray-300'
              }`}
            >
              {/* task details */}
              <h3 className="text-lg md:text-xl font-semibold leading-snug mb-1">{task.title}</h3>
              <p className="text-gray-700 text-sm md:text-base leading-snug mb-2">{task.description}</p>
              <hr className="border-gray-300 mb-2" />

              {/* task status and action buttons */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                {/* left side - status and created date */}
                <div className="flex flex-col w-full md:w-1/2">
                  <p className="text-sm md:text-sm text-gray-500 leading-snug mb-1">Status: {task.isCompleted ? 'Completed' : 'Pending'}</p>
                  <p className="text-xs md:text-sm text-gray-400 leading-snug">Created on: {new Date(task.createdAt).toLocaleDateString()}</p>
                </div>

                {/* right - action buttons */}
                <div className="flex gap-2 w-full md:w-1/2">
                  {task.isCompleted ? (
                    // Only Delete button, 1/3 width
                    <div className="flex justify-end w-full">
                      <Button
                        onClick={() => handleDelete(task.id)}
                        className="w-1/3 px-0 py-1 text-xs md:text-sm bg-red-600 text-white rounded hover:bg-red-800 cursor-pointer text-center"
                      >
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button className="flex-1 px-0 py-1 text-xs md:text-sm bg-blue-600 text-white rounded hover:bg-blue-800 cursor-pointer text-center">
                        Edit
                      </Button>
                      <Button className="flex-1 px-0 py-1 text-xs md:text-sm bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer text-center">
                        Complete
                      </Button>
                      <Button
                        onClick={() => handleDelete(task.id)}
                        className="flex-1 px-0 py-1 text-xs md:text-sm bg-red-600 text-white rounded hover:bg-red-800 cursor-pointer text-center"
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

      {infoMessage && <InfoPopup message={infoMessage} />}
    </div>
  );
};

export default AllTaskDisplay;
