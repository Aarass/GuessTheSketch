import type { IWordRepository } from "../../repositories/WordRepository";

export class WordService {
  constructor(private wordRepository: IWordRepository) {}

  public async addWord(wordText: string) {
    return this.wordRepository.addWord(wordText);
  }
  public async getAllWords() {
    return this.wordRepository.getAllWords();
  }
  public async getRandomWord() {
    return this.wordRepository.getRandomWord();
  }
}
