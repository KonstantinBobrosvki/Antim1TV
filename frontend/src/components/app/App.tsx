import { AlertsBox } from '../alertsBox/alertsBox';
import { AppRouter } from '../app.router';
import Footer from '../footer/footer';
import { AppNavbar } from '../navbar/navbar';
import { Stars } from '../stars/stars';
import './app.sass'
function App() {
  return (
    <>
      <AppNavbar />
      <AlertsBox />
      <Stars />
      <div className='page-wrapper'>
        <AppRouter />
      </div>
      <Footer />
    </>

  );
}

export default App;
