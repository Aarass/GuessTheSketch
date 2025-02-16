import { io } from "socket.io-client"
import React from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import App from "./App"
import { store } from "./app/store"
import "./index.css"

const container = document.getElementById("root")

// const result = await fetch("http://localhost:8080/login", {
//   headers: new Headers({ "content-type": "application/json" }),
//   method: "post",
//   body: JSON.stringify({
//     username: "Aaras",
//   }),
// })

// console.log(`Login result:`, result)

// const socket = io("ws://localhost:8080")
// const chat = io("ws://localhost:8080/chat")
// const drawings = io("ws://localhost:8080/drawings")
// const controls = io("ws://localhost:8080/controls")

// document.onclick = e => {
//   const tmp = {
//     x: e.clientX,
//     y: e.clientY,
//   }

//   drawings.emit("draw", JSON.stringify(tmp))
// }

if (container) {
  const root = createRoot(container)

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
  )
} else {
  throw new Error(
    "Root element with ID 'root' was not found in the document. Ensure there is a corresponding HTML element with the ID 'root' in your HTML file.",
  )
}
