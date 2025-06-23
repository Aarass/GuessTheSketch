import amqp from "amqplib";
import { connect as connectRedis } from "./drivers/redis";
import { listenForDrawings } from "./listeners/listenForDrawings.ts";

const url = process.env.AMQPURL ?? "amqp://localhost";

(async function () {
  await connectRedis();

  const connection = await amqp.connect(url);
  const drawingsChannel = await connection.createChannel();

  listenForDrawings(drawingsChannel);
})();

// import { listenForRequests } from "./listeners/listenForRequest.ts";
// const requestsChannel = await connection.createChannel();
// listenForRequests(requestsChannel);
