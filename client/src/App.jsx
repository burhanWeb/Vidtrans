import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthForm from "./components/AuthForm.jsx";
import UploadVideo from "./pages/UploadVideo.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/upload" element={<UploadVideo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
