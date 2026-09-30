import KeyvRedis from "@keyv/redis";
import { SessionData, Store } from "express-session";
import Keyv from "keyv";

export class KeyvSessionStore extends Store {
  private store: Keyv;

  constructor(redisUrl: string, redisPassword: string) {
    super();
    this.store = new Keyv({
      store: new KeyvRedis({
        url: redisUrl,
        password: redisPassword,
      }),
    });
  }

  // Método para obtener la sesión
  get(
    sid: string,
    callback: (err: Error | null, session?: SessionData | null) => void
  ): void {
    this.store
      .get<SessionData>(sid)
      .then((session) => callback(null, session ?? null))
      .catch((err) =>
        callback(err instanceof Error ? err : new Error(String(err)))
      );
  }

  // Método para guardar la sesión
  async set(
    sid: string,
    session: SessionData,
    callback: (err?: Error) => void
  ): Promise<void> {
    try {
      await this.store.set(sid, session);
      callback();
    } catch (err) {
      if (typeof callback === "function") {
        callback(err instanceof Error ? err : new Error(String(err)));
      } else {
        console.error("Error al guardar la sesión:", err);
      }
    }
  }

  // Método para destruir la sesión
  async destroy(sid: string, callback: (err?: Error) => void): Promise<void> {
    try {
      await this.store.delete(sid);
      if (typeof callback === "function") {
        callback();
      }
    } catch (err) {
      if (typeof callback === "function") {
        callback(err instanceof Error ? err : new Error(String(err)));
      } else {
        console.error("Error al destruir la sesión:", err);
      }
    }
  }
}
