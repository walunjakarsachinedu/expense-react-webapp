// css imports
import 'primereact/resources/primereact.min.css';
import "primereact/resources/themes/lara-dark-indigo/theme.css";
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './theme/colors.css';

import './App.css';
import { PrimeReactProvider } from 'primereact/api';
import NavBar from './components/NavBar';
import AllPersonTxsComp from './components/Transaction/AllPersonTxsComp';
import transactionData, { incomeData, upcomingExpenseData } from './DummyData';

function App() {
  return (
    <PrimeReactProvider>
      <NavBar></NavBar>
      <div style={{height: 70}}></div>
      <AllPersonTxsComp allPersonTxs={transactionData}></AllPersonTxsComp>
      <br /> <br />
      <AllPersonTxsComp allPersonTxs={upcomingExpenseData}></AllPersonTxsComp>
      <br /> <br />
      <AllPersonTxsComp allPersonTxs={incomeData}></AllPersonTxsComp>
    </PrimeReactProvider>
  );
}       

export default App;
