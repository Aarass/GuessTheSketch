import { Link } from "react-router"

export function NotLoggedIn() {
  return (
    <div>
      You need to be logged in. <Link to={"/"}>Log in</Link>
    </div>
  )
}
