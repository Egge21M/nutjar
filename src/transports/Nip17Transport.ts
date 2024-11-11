import { Event, generateSecretKey, SimplePool } from "nostr-tools";
import * as nip17 from "nostr-tools/nip17";
import { Transport } from "../types";
import { Proof } from "@cashu/cashu-ts";
import { getEncodedToken } from "@cashu/cashu-ts/dist/lib/es5/utils";

export class Nip17Transport implements Transport {
  private readonly pool: SimplePool;
  private readonly relays: string[];
  // private readonly verbose?: boolean;

  constructor(relays: string[]) {
    this.pool = new SimplePool();
    this.relays = relays;
    // if (verbose) {
    // this.verbose = true;
    // }
  }

  async send(proofs: Proof[], mintUrl: string, pubkey: string, memo?: string) {
    const encodedToken = getEncodedToken({ proofs, mint: mintUrl, memo });
    const randomSk = generateSecretKey();
    const wrap = nip17.wrapEvent(
      randomSk,
      { publicKey: pubkey },
      JSON.stringify(encodedToken),
    );
    console.log(wrap);
    const res = await Promise.allSettled(this.publishEvent(wrap));
    console.log(res);
    if (!res.some((p) => p.status === "fulfilled")) {
      throw new Error("Publishing failed...");
    }
  }
  publishEvent(e: Event, timeout?: number) {
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
}
