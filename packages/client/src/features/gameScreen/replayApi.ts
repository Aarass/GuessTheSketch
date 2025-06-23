import { backend } from "../../global"

export async function refresh() {
  return await fetch(`http://${backend}/replay/refresh`, {
    method: "get",
    credentials: "include",
  })
}
