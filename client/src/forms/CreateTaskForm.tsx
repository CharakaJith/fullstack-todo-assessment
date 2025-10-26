import api from '@/api';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { VALIDATE, ERROR } from '@/common/messages';

const CreateTaskForm: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [error, setError] = useState<string[]>([]);
  const [isError, setIsError] = useState<boolean>(false);

  // handle title on change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const titleValue = e.target.value;
    setTitle(titleValue);

    if (titleValue.trim().length > 0) {
      setIsError(false);
    }
  };

  // handle password on change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const descriptionValue = e.target.value;
    setDescription(descriptionValue);

    if (descriptionValue.trim().length > 0) {
      setIsError(false);
    }
  };

  // handle submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // validate inputs
    if (!title || title.trim().length === 0 || !description || description.trim().length === 0) {
      setError([VALIDATE.EMPTY_FIELDS]);
      setIsError(true);
    } else {
      // request body
      const taskData = {
        title: title,
        description: description,
      };

      // send request
      try {
        const res = await api.post('/api/v1/task', taskData);
        if (res.data.success) {
          window.location.reload();
        }
      } catch (error: any) {
        const responseData = error.response?.data?.response?.data;
        if (Array.isArray(responseData)) {
          setError(responseData.map((error) => error.message).filter(Boolean));
        } else if (responseData?.message) {
          setError([responseData.message]);
        } else {
          setError([ERROR.UNEXPECTED]);
        }
        setIsError(true);
      }
    }
  };

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
    <div className="flex w-full items-center justify-center px-5 cursor-default">
      {/* input card */}
      <div className="flex flex-col gap-4 w-full max-w-lg sm:max-w-md md:max-w-lg lg:max-w-sm p-6 rounded-2xl border border-gray-300    ">
        {/* card heading */}
        <h2 className="text-2xl font-bold text-left mb-1 text-gray-900">Create a New Task</h2>

        {/* form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* input fields */}
          <Input type="text" value={title} onChange={handleTitleChange} placeholder="Task Title" />
          <Textarea
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Short Description"
            className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />

          {/* error boxes */}
          {isError &&
            error.map((msg, index) => (
              <div key={index} className="w-full py-2 bg-red-500 text-white rounded-md text-sm text-center">
                {msg}
              </div>
            ))}

          {/* submit button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              className="cursor-pointer w-full md:w-[30%] bg-blue-600 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskForm;
