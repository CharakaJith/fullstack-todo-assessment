import TaskDisplay from '@/components/tasks/TaskDisplay';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <main className="w-[90%]">
        <TaskDisplay />
      </main>
    </div>
  );
};

export default LandingPage;
