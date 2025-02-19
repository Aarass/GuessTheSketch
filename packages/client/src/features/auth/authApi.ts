import { backend } from "../../global"

export async function login(username: string) {
  return await fetch(`http://${backend}/login`, {
    headers: new Headers({ "content-type": "application/json" }),
    method: "post",
    body: JSON.stringify({ username }),
    credentials: "include",
  })
}

export async function refresh() {
  return await fetch(`http://${backend}/refresh`, {
    method: "post",
    credentials: "include",
  })
}

export async function logout() {
  await fetch(`http://${backend}/logout`, {
    method: "post",
    credentials: "include",
  })
}
