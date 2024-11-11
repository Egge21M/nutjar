import { CashuMint, CashuWallet } from "@cashu/cashu-ts";
import { nip19 } from "nostr-tools";
import { TipCallbacks, Transport } from "./types";
import { Nip17Transport } from "./transports/Nip17Transport";
import { NutZapTransport } from "./transports/NutZapTransport";

export { NutZapTransport, Nip17Transport };

export class Nutjar {
  protected readonly pubkey: string;
  protected readonly wallet: CashuWallet;
  private readonly verbose: boolean = false;
  private readonly transport: Transport;

  constructor(
    mintUrl: string,
    npub: `npub1${string}`,
    transport: Transport,
    opts?: { verbose?: boolean },
  ) {
    this.pubkey = nip19.decode(npub).data;
    this.wallet = new CashuWallet(new CashuMint(mintUrl));
    this.transport = transport;
    if (opts?.verbose) {
      this.verbose = true;
    }
  }

  async tip(amountInSats: number, memo?: string, cb?: TipCallbacks) {
    this.log("getting quote for ", amountInSats, " SATS");
    try {
      const { quote, request } =
        await this.wallet.createMintQuote(amountInSats);
      this.log("received quote: ", quote);
      if (cb?.onInvoice) {
        this.log("called onInvoice callback");
        cb.onInvoice(request);
      }
      while (true) {
        this.log("checking quote's state");
        const { state } = await this.wallet.checkMintQuote(quote);
        if (state === "PAID") {
          this.log("quote is paid");
          break;
        }
        await new Promise((res) => {
          setTimeout(res, 5000);
        });
      }
      const { proofs } = await this.wallet.mintProofs(amountInSats, quote, {
        pubkey: "02" + this.pubkey,
      });
      await this.transport.send(
        proofs,
        this.wallet.mint.mintUrl,
        this.pubkey,
        memo,
      );
      if (cb?.onSuccess) {
        cb.onSuccess();
      }
    } catch (e) {
      if (e instanceof Error && cb?.onError) {
        cb.onError(e);
      }
    }
  }

  log(...data: any[]) {
    if (this.verbose) {
      console.log(data);
    }
  }
}
