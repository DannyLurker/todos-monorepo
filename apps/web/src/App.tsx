import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./router/routes";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <BrowserRouter>
        <Navbar />
        <main className="mx-auto w-full max-w-6xl px-4">
          <AppRoutes />
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;
