import Editor from "@monaco-editor/react";
import "./App.css";

function App() {
  return (
    <main className="h-screen w-full bg-gray-950 flex gap-4 p-4">
      <aside className="h-full w-1/4 bg-amber-50 rounded-lg"></aside>

      <section className="flex-1 bg-neutral-800 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="java"
          defaultValue="// some comment"
          theme="vs-dark"
        />
      </section>
    </main>
  );
}

export default App;