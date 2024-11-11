import { Proof } from "@cashu/cashu-ts";

export type TipCallbacks = {
  onInvoice?: (paymentRequest: string) => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

export interface Transport {
  send: (
    proofs: Proof[],
    mintUrl: string,
    pubkey: string,
    memo?: string,
  ) => Promise<void>;
}
