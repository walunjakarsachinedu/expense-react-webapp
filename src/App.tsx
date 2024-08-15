// css imports
import 'primereact/resources/primereact.min.css';
import "primereact/resources/themes/lara-dark-indigo/theme.css";
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import './App.css';
import { PrimeReactProvider } from 'primereact/api';
import TransactionTag from './components/TransactionTag';

function App() {
  return (
    <PrimeReactProvider>
      <div className='flex justify-content-center align-items-center'>
        <TransactionTag money={100} tag="pen"></TransactionTag>
      </div>
    </PrimeReactProvider>
  );
}       

export default App;
