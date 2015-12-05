interface I_AND{
    and(w1:Word,w2:Word):Word;
}
class AND implements I_AND{
    and(w1:Word, w2:Word):Word {
        var val:number = w1.value & w2.value;
        val = Word.trimExtraBits(val);
        return new Word(val);
    }

}