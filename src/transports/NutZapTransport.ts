import {
  Event,
  EventTemplate,
  finalizeEvent,
  generateSecretKey,
  SimplePool,
} from "nostr-tools";
import { Transport } from "../types";
import { Proof } from "@cashu/cashu-ts";
import { sumProofs } from "@cashu/cashu-ts/dist/lib/es5/utils";

export class NutZapTransport implements Transport {
  private readonly pool: SimplePool;
  private readonly relays: string[];
  private readonly verbose?: boolean;

  constructor(relays: string[], verbose?: boolean) {
    this.pool = new SimplePool();
    this.relays = relays;
    if (verbose) {
      this.verbose = true;
    }
  }

  async send(proofs: Proof[], mintUrl: string, pubkey: string, memo?: string) {
    const amountInSats = sumProofs(proofs);
    const eventTemplate: EventTemplate = {
      kind: 9321,
      content: memo || "",
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["amount", String(amountInSats)],
        ["unit", "sat"],
        ["proof", JSON.stringify(proofs)],
        ["u", mintUrl],
        ["p", pubkey],
      ],
    };
    const randomSk = generateSecretKey();
    const event = finalizeEvent(eventTemplate, randomSk);
    console.log(event);
    const res = await Promise.allSettled(this.publishEvent(event));
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
