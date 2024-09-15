// css imports
import 'primereact/resources/primereact.min.css';
import "primereact/resources/themes/lara-dark-indigo/theme.css";
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './theme/theme.css';
import './theme/colors.css';

import './App.css';
import { PrimeReactProvider } from 'primereact/api';
import NavBar from './components/NavBar';
import ExpensePanel from './components/Transaction/ExpensePanel';

function App() {
  return (
    <PrimeReactProvider>
      <NavBar></NavBar>
      <div style={{height: 70}}></div>
      <ExpensePanel></ExpensePanel>
      <br /> <br />
    </PrimeReactProvider>
  );
}       

export default App;
