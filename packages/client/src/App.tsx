import "./App.css"
import { Counter } from "./features/counter/Counter"
import { GameScreen } from "./features/gameScreen/GameScreen"
import { Quotes } from "./features/quotes/Quotes"
import logo from "./logo.svg"

const App = () => {
  return <GameScreen></GameScreen>
  // <div className="App">
  //   <header className="App-header">
  //     <button
  //       aria-label="Logout"
  //       onClick={async () => {
  //         const result = await fetch("http://localhost:8080/logout", {
  //           method: "post",
  //         })

  //         console.log("Logout reuslt:", result)
  //       }}
  //     ></button>
  //     <img src={logo} className="App-logo" alt="logo" />
  //     <Counter />
  //     <p>
  //       Edit <code>src/App.tsx</code> and save to reload.
  //     </p>
  //     <Quotes />
  //     <span>
  //       <span>Learn </span>
  //       <a
  //         className="App-link"
  //         href="https://reactjs.org"
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         React
  //       </a>
  //       <span>, </span>
  //       <a
  //         className="App-link"
  //         href="https://redux.js.org"
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         Redux
  //       </a>
  //       <span>, </span>
  //       <a
  //         className="App-link"
  //         href="https://redux-toolkit.js.org"
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         Redux Toolkit
  //       </a>
  //       <span>, </span>
  //       <a
  //         className="App-link"
  //         href="https://react-redux.js.org"
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         React Redux
  //       </a>
  //       ,<span> and </span>
  //       <a
  //         className="App-link"
  //         href="https://reselect.js.org"
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         Reselect
  //       </a>
  //     </span>
  //   </header>
  // </div>
}

export default App
