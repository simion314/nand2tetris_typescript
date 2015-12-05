interface ISumator {
    sum(word1:Word, word2:Word):Word;
}

class Sumator implements ISumator {
    sum(word1:Word, word2:Word):Word {
        var v1:number = word1.value;
        var v2:number = word2.value;
        return new Word(v1 + v2);
    }

}