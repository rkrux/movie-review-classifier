var positiveDocs, positiveUnique = 0, positiveWords = {},
    negativeDocs, negativeUnique = 0, negativeWords = {}, pivot;
var negationCheck = new RegExp("^(never|no|nothing|nowhere|nobody|none|not|haven|hasn|hadn|couldn|shouldn|wouldn|doesn|didn|isn|aren|neither|nor|cant|wont|dont)$");
var numberCheck = new RegExp("[0-9]");
var insigniCheck = ["and", "the", "to", "by", "on", "of", "in", "at", "an"];
pivot = positiveDocs = negativeDocs = Math.floor(0.99 * negatives.length);

$(document).ready(function(){
	if(window.localStorage !== undefined){
		train();
		//test();
	}
	else
		alert('Psst! Your browser is outdated and does not support Local Storage. Update to a new browser.');
})

function test(){
    var negtest, postest, correct = 0, incorrect = 0, accuracy;
    //console.log("TEST START");

    for (i = pivot; i < negatives.length; i++){
        negtest = guess(negatives[i]);
		//console.log("NEG " + negatives[i]);
        postest = guess(positives[i]);
		//console.log("POS " + positives[i]);

        if (negtest.value > 0.88)
            if (negtest.label == "negative")
                correct++;
            else
                incorrect++;
        if (postest.value > 0.88)
            if (postest.label == "positive")
                correct++;
            else
                incorrect++;
    }

    accuracy = Math.round(1000 * correct / (correct + incorrect)) / 10;
    //console.log("TEST END; Analyzer Accuracy: " + accuracy + "%");
}

function unique(text){
    var result = [];
    for (var i = 0; i < text.length; i++) {
        if (text[i].length == 1)
            continue;
		//if ($.inArray(text[i], insigniCheck) != -1)
			//continue;
        if ($.inArray(text[i], result) == -1)
            result.push(text[i]);
    }
    return result;
}

function tokenize(text){
    text = text.toLowerCase().replace(/\W/g, ' ').replace(/\s+/g, ' ').trim().split(' '); //	\W-non word character, \s-white space character, + for consecutive characters replaced by single modifier, /g- look globally; all of the matches
    text = unique(text);
    for (var i = 0; i < text.length; i++) {
        if (text[i].match(negationCheck)) {
            if (text[i - 1] != null)
                text[i - 1] = "~" + text[i - 1];
            if (text[i + 1] != null)
                text[i + 1] = "~" + text[i + 1];
        }
    }
    text = text.map(function(word) {
        return stemmer(word);
    });
    return text;
};

function train(){
    var i, j, temp, token = [];
	var CachePos = localStorage.getItem('BayesPositiveWords'), CacheNeg = localStorage.getItem("BayesNegativeWords");
	if(CachePos == null){
	console.log("POS NOT SET");
    for (i = 0; i < positiveDocs; i++) {
        token = tokenize(positives[i]);
        for (j = 0; j < token.length; j++) {
            if (token[j].match(numberCheck))
                continue;
            if (!positiveWords.hasOwnProperty(token[j])) {
                positiveWords[token[j]] = 1;
                positiveUnique++;
            } else {
                temp = positiveWords[token[j]];
                temp++;
                positiveWords[token[j]] = temp;
            }
        }
    }
	localStorage.setItem('BayesPositiveWords', JSON.stringify(positiveWords));
    /*console.log("Positive Data");
    console.log("Positive Docs " + positiveDocs);
    console.log("Positive Unique Words " + positiveUnique);
    for (var key in positiveWords)
        if (positiveWords.hasOwnProperty(key))
            console.log(key + " -> " + positiveWords[key]);*/
	}
	else{
		positiveWords = JSON.parse(CachePos);
		//console.log(positiveWords);
	}
	if(CacheNeg == null){
	console.log("NEG NOT SET");
    for (i = 0; i < negativeDocs; i++) {
        token = tokenize(negatives[i]);
        for (j = 0; j < token.length; j++) {
            if (token[j].match(numberCheck))
                continue;
            if (!negativeWords.hasOwnProperty(token[j])) {
                negativeWords[token[j]] = 1;
                negativeUnique++;
            } else {
                temp = negativeWords[token[j]];
                temp++;
                negativeWords[token[j]] = temp;
            }
        }
    }
	localStorage.setItem('BayesNegativeWords', JSON.stringify(negativeWords));
    /*console.log("Negative Data");
    console.log("Negative Docs " + positiveDocs);
    console.log("Negative Unique Words " + negativeUnique);
    for (var key in negativeWords)
        if (negativeWords.hasOwnProperty(key))
            console.log(key + " -> " + negativeWords[key]);*/
	}
	else{
		negativeWords = JSON.parse(CacheNeg);
		//console.log(negativeWords);
	}
};

function guess(input){
        if (input == "")
            return -1;

        var totalWordCount, word, wordPosCount, wordNegCount, wordPosProb, wordNegProb, PosSum = 0, NegSum = 0, wordProb;
		var phrase = tokenize(input);
        //	console.log(phrase);
		
        for (var j = 0; j < phrase.length; j++) {
            word = phrase[j];
            if (positiveWords.hasOwnProperty(word))
                wordPosCount = positiveWords[word];
            else
                wordPosCount = 0;
            if (negativeWords.hasOwnProperty(word))
                wordNegCount = negativeWords[word];
            else
                wordNegCount = 0;
            totalWordCount = wordPosCount + wordNegCount;

            if (totalWordCount <= 3)
                continue;
            else {
                wordPosProb = wordPosCount / totalWordCount;
                if (wordPosProb === 1)
                    wordPosProb = 0.99;
                else if (wordPosProb === 0)
                    wordPosProb = 0.01;
                PosSum += (Math.log(1 - wordPosProb) - Math.log(wordPosProb));

                wordNegProb = wordNegCount / totalWordCount;
                if (wordNegProb === 1)
                    wordNegProb = 0.99;
                else if (wordNegProb === 0)
                    wordNegProb = 0.01;
                NegSum += (Math.log(1 - wordNegProb) - Math.log(wordNegProb));
            }
        }
        Postemp = (1 / (1 + Math.exp(PosSum)));
        Negtemp = (1 / (1 + Math.exp(NegSum)));
        //console.log("Pos", Postemp);
        //console.log("Neg", Negtemp);

        if ((Postemp > 0.4) && (Postemp < 0.6))
			return {label: "neutral", value: Postemp};
        else if (Postemp > 0.6)
			return {label: "positive", value: Postemp};
		else
            return {label: "negative", value: Negtemp};
    }
 

    