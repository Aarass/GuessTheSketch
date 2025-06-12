import type { IWordRepository } from "../../repositories/WordRepository";

export class WordService {
  constructor(private wordRepository: IWordRepository) {}

  async addWord(wordText: string) {
    return this.wordRepository.addWord(wordText);
  }
  async getAllWords() {
    return this.wordRepository.getAllWords();
  }
  async getRandomWord() {
    return this.wordRepository.getRandomWord();
  }
}
