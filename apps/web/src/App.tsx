import { Button } from "@/core/atomic-components/button";

function App() {
  return (
    <>
      <div className="flex min-h-svh flex-col items-center justify-center">
        <h1 className="text-3xl font-bold underline">Hello world!</h1>
        <Button className="bg-primary text-primary-foreground">Click me</Button>
      </div>
    </>
  );
}

export default App;
