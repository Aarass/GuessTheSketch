import { HttpServer } from "./HttpServer";
import { createServer } from "http";
import { SocketServer } from "./SocketServer";

export class App {
  private rawServer = createServer();
  private httpServer = new HttpServer(this.rawServer);
  private socketServer = new SocketServer(this.rawServer);

  public run() {
    this.rawServer.listen(8080, "0.0.0.0", () => {
      console.log("server started on: ", this.rawServer.address());
    });
    console.log("ran");
  }
}
