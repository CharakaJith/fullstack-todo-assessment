import CreateTaskForm from '@/forms/CreateTaskForm';
import AllTaskDisplay from './AllTaskDisplay';

const TaskDisplay: React.FC = () => {
  return (
    <div className="bg-gray-200 h-[90vh] rounded-lg flex items-center justify-center border-2 border-gray-300 p-2">
      <div className="bg-white w-full sm:w-[95%] h-full sm:h-[90%] rounded-lg flex flex-col sm:flex-row shadow-md">
        {/* left side - create task form */}
        <div className="flex-1 flex items-center justify-center p-2">
          <CreateTaskForm />
        </div>

        {/* divider */}
        <div className="hidden sm:block w-0.5 h-[90%] bg-gray-400 self-center"></div>

        {/* right side - task display */}
        <div className="flex-1 flex flex-col p-2 mt-2 sm:mt-0 h-full overflow-auto">
          <AllTaskDisplay />
        </div>
      </div>
    </div>
  );
};

export default TaskDisplay;
