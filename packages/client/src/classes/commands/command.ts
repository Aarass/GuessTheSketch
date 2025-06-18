export abstract class Command {
  abstract execute(): void
  abstract getName(): string
}
