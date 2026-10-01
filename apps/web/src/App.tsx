import { BrowserRouter } from "react-router-dom";
import "./App.css";
import AppRoutes from "./router/routes";

function App() {
  return (
    <div>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
}

export default App;
