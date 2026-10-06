import { createGreeter as createSubpathGreeter } from '@repro/lib-subpath';
import { createGreeter as createRelativeGreeter } from '@repro/lib-relative';

export class GreetingService {
  greetBoth(): string[] {
    return [createSubpathGreeter().greet('subpath'), createRelativeGreeter().greet('relative')];
  }
}
