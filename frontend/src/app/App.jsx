import "./App.css";
import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { useEffect, useMemo, useRef, useState } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";

function App() {
  const editorRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);

  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || "";
  });

  const [users, setUsers] = useState([]);

  const ydoc = useMemo(() => new Y.Doc(), []);
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  const handleMount = (editor) => {
    editorRef.current = editor;

    if (!bindingRef.current) {
      bindingRef.current = new MonacoBinding(
        yText,
        editor.getModel(),
        new Set([editor])
      );
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();

    const name = e.target.username.value.trim();

    if (!name) return;

    setUsername(name);

    window.history.pushState(
      {},
      "",
      `?username=${encodeURIComponent(name)}`
    );
  };

  useEffect(() => {
    if (!username) return;

    const provider = new SocketIOProvider(
      "http://localhost:3000",
      "monaco",
      ydoc,
      {
        autoConnect: true,
      }
    );

    providerRef.current = provider;

    provider.awareness.setLocalStateField("user", {
      username,
    });

    const updateUsers = () => {
      const states = Array.from(
        provider.awareness.getStates().values()
      );

      const connectedUsers = states
        .filter((state) => state.user?.username)
        .map((state) => state.user);

      setUsers(connectedUsers);
    };

    provider.on("status", (event) => {
      console.log("Connection status:", event.status);
    });

    provider.on("sync", (synced) => {
      console.log("Synced:", synced);
    });

    provider.awareness.on("change", updateUsers);

    updateUsers();

    const handleBeforeUnload = () => {
      provider.awareness.setLocalStateField("user", null);
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      provider.awareness.off("change", updateUsers);

      provider.disconnect();

      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [username, ydoc]);

  if (!username) {
    return (
      <main className="h-screen w-full bg-gray-950 flex items-center justify-center">
        <form
          onSubmit={handleJoin}
          className="flex flex-col gap-4"
        >
          <input
            name="username"
            placeholder="Enter username"
            className="p-3 rounded bg-gray-800 text-white"
          />

          <button
            type="submit"
            className="p-3 rounded bg-amber-100 text-black font-bold"
          >
            Join
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="h-screen w-full bg-gray-950 flex gap-4 p-4">
      <aside className="w-1/4 bg-white rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-bold text-xl">
            Connected Users
          </h2>
        </div>

        <ul className="p-4">
          {users.map((user, index) => (
            <li
              key={`${user.username}-${index}`}
              className="mb-2 p-2 rounded bg-gray-800 text-white"
            >
              {user.username}
            </li>
          ))}
        </ul>
      </aside>

      <section className="w-3/4 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// Start typing..."
          theme="vs-dark"
          onMount={handleMount}
        />
      </section>
    </main>
  );
}

export default App;