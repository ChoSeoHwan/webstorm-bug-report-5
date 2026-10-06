import { createGreeter as createSubpathGreeter } from '@repro/lib-subpath';
import { createGreeter as createRelativeGreeter } from '@repro/lib-relative';
import { createGreeter as createPeerGreeter } from '@repro/lib-peer';
import { GreetingService } from '#src/greeting.service.js';

// Cmd+Click on `greet` / `createSubpathGreeter` below
const subpathGreeter = createSubpathGreeter();
console.log(subpathGreeter.greet('subpath'));

// Cmd+Click on `greet` / `createRelativeGreeter` below
const relativeGreeter = createRelativeGreeter();
console.log(relativeGreeter.greet('relative'));

// Cmd+Click on `greet` / `createPeerGreeter` below (lib-peer has peerDependencies -> virtual package under PnP)
const peerGreeter = createPeerGreeter();
console.log(peerGreeter.greet('peer'));

console.log(new GreetingService().greetBoth());
