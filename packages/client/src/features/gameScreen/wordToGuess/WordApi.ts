import { backend } from "../../../global"

export async function MakeGetCurrentWordRequest() {
  return await fetch(`http://${backend}/word`, {
    method: "get",
    credentials: "include",
  })
}
