import React from "react"
import { BrowserRouter, Route, Routes } from "react-router"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { store } from "./app/store"
import "./index.css"
import { Rooms } from "./features/rooms/Rooms"
import { Lobby } from "./features/lobby/Lobby"
import { GameScreen } from "./features/gameScreen/GameScreen"
import { Login } from "./features/auth/LoginScreen"
import { refresh } from "./features/auth/AuthSlice"

store.dispatch(refresh())

const container = document.getElementById("root")

if (container) {
  const root = createRoot(container)

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/game" element={<GameScreen />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </React.StrictMode>,
  )
} else {
  throw new Error(
    "Root element with ID 'root' was not found in the document. Ensure there is a corresponding HTML element with the ID 'root' in your HTML file.",
  )
}
