import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./components/layout/AppShell";
import Dashboard from "./pages/Dashboard/Dashboard";
import HSKLevels from "./pages/HSKLevels/HSKLevels";
import Lessons from "./pages/Lessons/Lessons";
import Lesson from "./pages/Lesson/Lesson";
import Login from "./pages/Login/LoginTemp";
import Register from "./pages/Register/Register";
import Vocabulary from "./pages/Vocabulary/Vocabulary";
import VocabularyDetail from "./pages/VocabularyDetail/VocabularyDetail";
import Chat from "./pages/Chat/Chat";
import Videos from "./pages/Videos/Videos";
import Listening from "./pages/Listening/Listening";
import Progress from "./pages/Progress/Progress";
import Settings from "./pages/Settings/Settings";
import ProtectedRoute from "./components/auth/ProtectedRoute";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/hsk" element={<HSKLevels />} />
          <Route path="/hsk/:levelId/lessons" element={<Lessons />} />
          <Route path="/hsk/:levelId/lessons/:lessonId" element={<Lesson />} />

          <Route path="/chat" element={<Chat />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/listening" element={<Listening />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/vocabulary/:id" element={<VocabularyDetail />} />
        </Route>  
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;