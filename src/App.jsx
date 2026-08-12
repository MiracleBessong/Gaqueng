import { useState } from "react";
import JoinScreen from "./assets/Component/JoinScreen";
import RoomScreen from "./assets/Component/RoomScreen";
import "./App.css";

export default function App() {
  const [session, setSession] = useState(null);

  if (!session) return <JoinScreen onJoin={setSession} />;
  return (
    <RoomScreen
      name={session.name}
      roomCode={session.roomCode}
      myLang={session.myLang}
      setMyLang={() => {}}
      onLeave={() => setSession(null)}
    />
  );
}
