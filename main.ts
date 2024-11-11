import { Nutjar, NutZapTransport } from "./src";

const jar = new Nutjar(
  "https://testnut.cashu.space",
  "npub1mhcr4j594hsrnen594d7700n2t03n8gdx83zhxzculk6sh9nhwlq7uc226",
  new NutZapTransport(["wss://relay.damus.io"]),
);

jar.tip(21, "Test tip!", {
  onInvoice: (i) => {
    console.log(i);
  },
});
