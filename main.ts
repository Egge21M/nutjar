import { Nutjar } from "./src/main";

const jar = new Nutjar(
  "https://testnut.cashu.space",
  "npub1mhcr4j594hsrnen594d7700n2t03n8gdx83zhxzculk6sh9nhwlq7uc226",
  [""],
);

jar.tip(21, "Test tip!", {
  onInvoice: (i) => {
    console.log(i);
  },
});
