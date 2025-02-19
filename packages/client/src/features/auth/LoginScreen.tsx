import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { login, selectMyId } from "../auth/AuthSlice"
import { useNavigate } from "react-router"

export function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const myId = useAppSelector(selectMyId)

  useEffect(() => {
    if (myId) {
      navigate("/rooms")
    }
  }, [myId])

  return (
    <div className="flex h-full w-full items-center justify-center">
      <form
        onSubmit={async e => {
          e.preventDefault()
          dispatch(login(username))
        }}
      >
        <div className="flex flex-col">
          <input
            placeholder="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />

          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  )
}
