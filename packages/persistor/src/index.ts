import amqp from "amqplib";
import { listenForDrawings } from "./listeners/listenForDrawings.ts";
import { listenForRequests } from "./listeners/listenForRequest.ts";

const url = process.env.AMQPURL ?? "amqp://localhost";

(async function () {
  const connection = await amqp.connect(url);

  const drawingsChannel = await connection.createChannel();
  const requestsChannel = await connection.createChannel();

  listenForDrawings(drawingsChannel);
  listenForRequests(requestsChannel);
})();
