import React from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { BrowserRouter, Outlet, Route, Routes } from "react-router"
import { useAppSelector } from "./app/hooks"
import { store } from "./app/store"
import { refresh, selectMyId } from "./features/auth/AuthSlice"
import { Login } from "./features/auth/LoginScreen"
import { NotLoggedIn } from "./features/auth/RedirectToLoginScreen"
import { GameScreen } from "./features/gameScreen/GameScreen"
import { Lobby } from "./features/lobby/Lobby"
import { Rooms } from "./features/rooms/Rooms"
import "./index.css"
import { EndScreen } from "./features/endScreen/EndScreen"
import { Context } from "./features/context/Context"
import { GameState } from "./features/gameScreen/GameState"
import { ConnectionManager } from "./classes/ConnectionManager"

store.dispatch(refresh())

const container = document.getElementById("root")

const gameState = new GameState()
const connectionManager = ConnectionManager.getInstance()

if (container) {
  const root = createRoot(container)

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <Context.Provider
          value={{
            gameState,
            connectionManager,
          }}
        >
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/lobby" element={<Lobby />} />
                <Route path="/game" element={<GameScreen />} />

                <Route path="/end" element={<EndScreen />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </Context.Provider>
      </Provider>
    </React.StrictMode>,
  )
} else {
  throw new Error(
    "Root element with ID 'root' was not found in the document. Ensure there is a corresponding HTML element with the ID 'root' in your HTML file.",
  )
}

export default function ProtectedRoute() {
  const myId = useAppSelector(selectMyId)

  if (myId === undefined) {
    return <></>
  } else if (myId === null) {
    return <NotLoggedIn />
  } else {
    return <Outlet />
  }
}
