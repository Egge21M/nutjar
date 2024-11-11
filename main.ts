import { Nutjar } from "./src";
import { Nip17Transport } from "./src/transports/Nip17Transport";

const jar = new Nutjar(
  "https://mint.minibits.cash/Bitcoin",
  "npub1mhcr4j594hsrnen594d7700n2t03n8gdx83zhxzculk6sh9nhwlq7uc226",
  new Nip17Transport(["wss://relay.damus.io", "wss://nostr.mom"]),
);

jar.tip(21, "Test tip!", {
  onInvoice: (i) => {
    console.log(i);
  },
  onSuccess: () => {
    console.log("Tip sent!");
  },
});
