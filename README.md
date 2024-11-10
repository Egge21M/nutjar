# nutjar

The easiest way to receive permissionless Lightning donations on a website

## Usage

Check out `dev.ts` for a full example

```ts
import { Nutjar } from "./src/main";

const jar = new Nutjar(
  "https://testnut.cashu.space",
  "npub1mhcr4j594hsrnen594d7700n2t03n8gdx83zhxzculk6sh9nhwlq7uc226",
  ["wss://relay.damus.io"],
);

jar.tip(21, "Test tip!", {
  onInvoice: (i) => {
    console.log(i);
  },
  onSuccess: () => {
    console.log("Donation sent!");
  },
  onError: (e: Error) => {
    console.error(e);
  },
});
```

## Installation

nutjar can be installed using a package manager or by loading the bundled version from a CDN

### npm

```sh
npm i nutjar
```
