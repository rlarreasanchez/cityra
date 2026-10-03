import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-primary">
      <Outlet />
    </main>
  );
}

export default AuthLayout;
