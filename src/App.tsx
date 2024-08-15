// css imports
import 'primereact/resources/primereact.min.css';
import "primereact/resources/themes/lara-dark-indigo/theme.css";
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './theme/colors.css';

import './App.css';
import { PrimeReactProvider } from 'primereact/api';
import TransactionTag from './components/TransactionTag';
import NavBar from './components/NavBar';

function App() {
  return (
    <PrimeReactProvider>
      <NavBar></NavBar>
      <div style={{height: 70}}></div>
      <div className='flex'> <div style={{width: 20}}></div>
        <TransactionTag money={10} tag="installment"></TransactionTag>
      </div>
    </PrimeReactProvider>
  );
}       

export default App;
