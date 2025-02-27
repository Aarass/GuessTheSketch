import { useAppDispatch } from "../../app/hooks"
import { logout } from "../auth/AuthSlice"

export function LogoutButton() {
  const dispatch = useAppDispatch()

  return <button onClick={() => dispatch(logout())}>Logout</button>
}
