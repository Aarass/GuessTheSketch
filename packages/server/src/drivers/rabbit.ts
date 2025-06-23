import amqp from "amqplib";
import { err, ok, type Result } from "neverthrow";

const url = process.env.AMQPURL ?? "amqp://localhost";

let connection: amqp.ChannelModel | null = null;

export async function connect(): Promise<Result<amqp.ChannelModel, void>> {
  try {
    if (!connection) {
      connection = await amqp.connect(url);
    }

    return ok(connection);
  } catch (error) {
    console.error(error);
    return err();
  }
}

export async function getChannel(): Promise<Result<amqp.Channel, void>> {
  try {
    if (!connection) {
      await connect();
    }

    const channel = await connection!.createChannel();
    return ok(channel);
  } catch (error) {
    console.error(error);
    return err();
  }
}
