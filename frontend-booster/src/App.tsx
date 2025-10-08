import "./App.css";
import { Button } from "./components/ui/button";
import { Input } from "@/components/ui/input";

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Input />
      <div className="m-1"></div>
      <Button>Click me</Button>
    </div>
  );
}

export default App;
