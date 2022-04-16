import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { createBrowserHistory } from "history";
import Index from 'pages/Index'
import Admin from 'pages/Admin'

const history = createBrowserHistory();

export default function App() {
  
  return (
    <Router history={history}>
      <Switch>
        <Route exact path="/" component={Index} />
        <Route exact path="/admin" component={Admin} />
        <Redirect to='/'/>
      </Switch>
    </Router>
  );
}

