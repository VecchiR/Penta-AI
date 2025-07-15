import { MongoClient, ServerApiVersion } from "mongodb";
import { createId, isCuid } from "@paralleldrive/cuid2";

const { DB_NAME, DB_URI } = process.env;
// Use globalThis to persist the client across serverless invocations
let client = globalThis._mongoClient;

export async function makeDb() {
  if (!client || !(client instanceof MongoClient) || !client.topology?.isConnected()) {
    client = new MongoClient(DB_URI, {
      monitorCommands: true,
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    await client.connect();
    globalThis._mongoClient = client;
    await client.db(DB_NAME).command({ ping: 1 });
    console.info("successfully connected to the database");
  }
  return client.db(DB_NAME);
}

export function makeId() {
  return createId();
}

export function isValidId(id) {
  return isCuid(id);
}
