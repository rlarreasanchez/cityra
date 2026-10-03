import { Suspense } from "react";
import { Outlet } from "react-router";

function App() {
  return (
    <Suspense
      fallback={
        <div role="status" aria-live="polite" className="sr-only">
          Cargando…
        </div>
      }
    >
      <Outlet />
    </Suspense>
  );
}

export default App;
