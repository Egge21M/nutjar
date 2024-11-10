import { CashuMint, CashuWallet } from "@cashu/cashu-ts";
import {
  EventTemplate,
  finalizeEvent,
  generateSecretKey,
  nip19,
} from "nostr-tools";

type TipCallbacks = {
  onInvoice?: (paymentRequest: string) => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

export class Nutjar {
  private readonly pubkey: string;
  private readonly relays: string[];
  private readonly wallet: CashuWallet;

  constructor(mintUrl: string, npub: `npub1${string}`, relays: string[]) {
    this.pubkey = nip19.decode(npub).data;
    this.relays = relays;
    this.wallet = new CashuWallet(new CashuMint(mintUrl));
  }

  async tip(amountInSats: number, memo?: string, cb?: TipCallbacks) {
    try {
      const { quote, request } =
        await this.wallet.createMintQuote(amountInSats);
      if (cb?.onInvoice) cb.onInvoice(request);
      while (true) {
        const { state } = await this.wallet.checkMintQuote(quote);
        if (state === "PAID") {
          break;
        }
        await new Promise((res) => {
          setTimeout(res, 5000);
        });
      }
      const { proofs } = await this.wallet.mintProofs(amountInSats, quote, {
        pubkey: "02" + this.pubkey,
      });
      const eventTemplate: EventTemplate = {
        kind: 9321,
        content: memo || "",
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ["amount", String(amountInSats)],
          ["unit", "sat"],
          ["proof", JSON.stringify(proofs)],
          ["u", this.wallet.mint.mintUrl],
          ["p", this.pubkey],
        ],
      };
      const randomSk = generateSecretKey();
      const event = finalizeEvent(eventTemplate, randomSk);
      console.log(event);
    } catch (e) {
      if (e instanceof Error && cb?.onError) {
        cb.onError(e);
      }
    }
  }
}
