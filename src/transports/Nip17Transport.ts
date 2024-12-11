import { Event, generateSecretKey, SimplePool } from "nostr-tools";
import * as nip17 from "nostr-tools/nip17";
import { Transport } from "../types";
import { Proof, getEncodedToken } from "@cashu/cashu-ts";

export class Nip17Transport implements Transport {
  private readonly pool: SimplePool;
  private readonly relays: string[];
  private readonly verbose?: boolean;

  constructor(relays: string[], opts?: { verbose: boolean }) {
    this.pool = new SimplePool();
    this.relays = relays;
    if (opts?.verbose) {
      this.verbose = true;
    }
  }

  async send(proofs: Proof[], mintUrl: string, pubkey: string, memo?: string) {
    this.log("Sending proofs to target");
    const encodedToken = getEncodedToken({ proofs, mint: mintUrl, memo });
    const randomSk = generateSecretKey();
    const wrap = nip17.wrapEvent(
      randomSk,
      { publicKey: pubkey },
      JSON.stringify(encodedToken),
    );
    const res = await Promise.allSettled(this.publishEvent(wrap));
    this.log(res);
    if (!res.some((p) => p.status === "fulfilled")) {
      throw new Error("Publishing failed...");
    }
  }
  publishEvent(e: Event, timeout?: number) {
    this.log("Publishing event... ", e);
    return this.pool.publish(this.relays, e).map((promise) =>
      Promise.race([
        promise,
        new Promise((_, rej) => {
          setTimeout(() => {
            rej("Timeout exceeded");
          }, timeout || 3500);
        }),
      ]),
    );
  }
  log(...data: any[]) {
    if (this.verbose) {
      console.log(data);
    }
  }
}
