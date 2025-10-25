import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen text-center space-y-4 bg-cover bg-center bg-no-repeat text-black"
      style={{ backgroundImage: `url(/src/assets/images/space.jpg)` }}
    >
      <h1
        className="text-[60px] sm:text-[80px] md:text-[100px] lg:text-[120px] font-extrabold leading-none drop-shadow-lg text-white"
        style={{
          textShadow: '-3px -3px 0 black, 3px -3px 0 black, -3px 3px 0 black, 3px 3px 0 black',
        }}
      >
        404 - Error
      </h1>
      <p
        className="text-[30px] md:text-[50px] text-white"
        style={{
          textShadow: '-2px -2px 0 black, 2px -2px 0 black, -2px 2px 0 black, 2px 2px 0 black',
        }}
      >
        PAGE NOT FOUND
      </p>
      <p
        className="text-[10px] md:text-[20px] text-white"
        style={{
          textShadow: '-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black',
        }}
      >
        Your search has ventured beyond the known universe!
      </p>
      <Button className="bg-gray-50 hover:bg-gray-300 text-black cursor-pointer text-xl py-5 px-6" onClick={handleGoBack}>
        Go back
      </Button>
    </div>
  );
};

export default NotFoundPage;
