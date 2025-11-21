import mongoose from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI missing");

interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

declare global {
  var _mongoose: MongooseCache | undefined;
}

let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connect() {
  if (cached!.conn) return cached!.conn;
  if (!cached!.promise)
    cached!.promise = mongoose.connect(MONGODB_URI).then((m) => m.connection);
  cached!.conn = await cached!.promise;
  return cached!.conn;
}
