import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NavBar } from "./components/NavBar";
import { Banner } from "./components/Banner";
import { Skills } from "./components/Skills";
// import { GitHubActivity } from "./components/GitHubActivity";
// import { CV } from "./components/CV";
// import { Projects } from "./components/Projects";
// import { Contact } from "./components/Contact";
// import { Footer } from "./components/Footer";
import GitHubCalendar from 'react-github-calendar';


function App() {
  return (
    <div className="App">
      <NavBar />
      <Banner />
      <Skills /> 
      {/* <GitHubCalendar username="azhang4216" /> */}
      {/* <Projects /> */}
      {/* <Contact /> */}
      {/* <Footer /> */}
    </div>
  );
}

export default App;
