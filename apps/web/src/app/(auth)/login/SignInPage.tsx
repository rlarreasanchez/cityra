import { MapPin, ShieldCheck } from "lucide-react";

const SignInPage = () => {
  return (
    <section className="relative z-10 flex min-h-screen w-full flex-col px-6 py-6 sm:px-10 lg:px-16 lg:py-8">
      <header className="flex items-center justify-between">
        <div className="hidden items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground sm:flex">
          <span className="h-2 w-2 rounded-full bg-secondary shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-secondary)_12%,transparent)]" />
          Plataforma operativa · Smart City
        </div>
      </header>

      <div className="grid flex-1 items-center gap-14 py-12 lg:grid-cols-[1fr_420px] lg:gap-24 lg:py-8">
        <div className="max-w-180">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-white/75 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-secondary shadow-sm backdrop-blur">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            Inteligencia urbana conectada
          </div>
          <h1 className="max-w-2xl text-5xl text-primary font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl lg:text-[76px]">
            La ciudad, <span className="text-secondary">en movimiento.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Gestiona, localiza y mantiene todos tus activos TIC desde un único
            espacio diseñado para tomar mejores decisiones.
          </p>
          <div className="mt-11 flex flex-wrap gap-3">
            {[
              "Visión en tiempo real",
              "Gestión eficiente",
              "Datos que conectan",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-full border border-white bg-white/75 px-4 py-2 text-sm font-medium text-accent-foreground shadow-sm backdrop-blur"
              >
                <ShieldCheck
                  className="h-4 w-4 text-secondary"
                  aria-hidden="true"
                />{" "}
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative w-full max-w-105 justify-self-center lg:justify-self-end">
          <div className="absolute -inset-5 rounded-[34px] bg-linear-to-br from-accent/30 to-border/20 blur-2xl" />
          <div className="relative rounded-[28px] border border-white/90 bg-white/90 p-7 shadow-[0_26px_36px_color-mix(in_oklab,var(--color-accent-foreground)_14%,transparent)] backdrop-blur-xl sm:p-9">
            <div className="mb-8 flex items-center gap-3">
              <div>
                <p className="text-sm font-semibold text-primary">
                  Acceso a Cityra
                </p>
                <p className="text-xs text-muted-foreground">
                  Tu ciudad, bajo control
                </p>
              </div>
            </div>
            <div className="mb-7">
              <h2 className="text-2xl font-semibold tracking-tight text-primary">
                Bienvenido de nuevo
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Introduce tus credenciales para continuar.
              </p>
            </div>
            <p className="mt-7 text-center text-xs leading-5 text-muted-foreground">
              Al continuar, aceptas nuestras{" "}
              <a href="#terms" className="font-medium text-secondary">
                condiciones de uso
              </a>{" "}
              y{" "}
              <a href="#privacy" className="font-medium text-secondary">
                política de privacidad
              </a>
              .
            </p>
          </div>
        </div>
      </div>
      <footer className="flex items-center justify-between border-t border-border pt-5 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} Cityra</span>
        <span className="hidden sm:inline">
          Infraestructura digital para ciudades inteligentes
        </span>
        <span>v1.0.0</span>
      </footer>
    </section>
  );
};

export default SignInPage;
