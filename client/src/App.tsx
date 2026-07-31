import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Home } from "./pages/Home";
import { BoardList } from "./pages/BoardList";
import { PostDetail } from "./pages/PostDetail";
import { PostEdit } from "./pages/PostEdit";
import { PhotoGallery } from "./pages/PhotoGallery";
import { PhotoUpload } from "./pages/PhotoUpload";
import { AdminUsers } from "./pages/AdminUsers";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/board/:boardType" element={<BoardList />} />
          <Route path="/board/:boardType/write" element={<PostEdit />} />
          <Route path="/board/:boardType/:id" element={<PostDetail />} />
          <Route path="/board/:boardType/:id/edit" element={<PostEdit />} />
          <Route path="/photos" element={<PhotoGallery />} />
          <Route path="/photos/upload" element={<PhotoUpload />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
