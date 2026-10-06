export class Greeter {
  greet(name: string): string {
    return `Hello, ${name}`;
  }
}

export function createGreeter(): Greeter {
  return new Greeter();
}
