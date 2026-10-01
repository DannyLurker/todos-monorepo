import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Todos from "../pages/Todos";
import { LoginForm } from "@/components/login-form";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/todos" element={<Todos />} />
    </Routes>
  );
};

export default AppRoutes;
