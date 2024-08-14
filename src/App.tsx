// css imports
import 'primereact/resources/primereact.min.css';
import "primereact/resources/themes/lara-dark-indigo/theme.css";
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import './App.css';
import { PrimeReactProvider } from 'primereact/api';
import { Button } from 'primereact/button';

function App() {
  return (
    <PrimeReactProvider>
      <div className='flex justify-content-center align-items-center'>
        <Button label='hello world'></Button>
      </div>
    </PrimeReactProvider>
  );
}

export default App;
