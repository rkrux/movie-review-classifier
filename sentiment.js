var labels = [],
    words = [],
    probability = [];

var negation = new RegExp("^(never|no|nothing|nowhere|nobody|none|not|haven|hasn|hadn|couldn|shouldn|wouldn|doesn|didn|isn|aren|neither|nor|cant|wont|dont)$");
// ^ = Match the word at start eg: ^A matches in An but not in nAn.    $ = At end.

var pivot = Math.floor(0.99 * negatives.length);

$(document).ready(function () {
    var phrase, answer, i;
    //Shuffle
    negatives.sort(function () {
        return Math.random() - 0.5;
    });
    positives.sort(function () {
        return Math.random() - 0.5;
    });
    //Train
    for (i = 0; i < pivot; i++) {
        train(negatives[i], 'negative');
        train(positives[i], 'positive');
    }

    document.getElementById("test").addEventListener('click', test);
    document.getElementById("review").addEventListener('click', makeReview);
})

function makeReview() {
    $('#reviewResult').empty();
    var count = 0,
        total = 0;
    //	for(i=0; i< reviewStore.length; i++)
    //		$('#reviewResult').append('<div id="listrev"><div id="quote">' + reviewStore[i].quote + '</div><div id="date"> | ' + reviewStore[i].date + '</div><div id="publication"> | ' + reviewStore[i].publication + '</div><div id="critic">- ' + reviewStore[i].critic + '</div></div><br>');
    if (reviewStore.length == 0)
        $('#reviewResult').append("<div id='quote'> No reviews found for the movie.<br> </div>");
    else {
        for (i = 0; i < reviewStore.length; i++) {
            phrase = reviewStore[i].quote;
            answer = guess(phrase);
            if (answer != -1) {
                //	$('#reviewResult').append('<br><div id="quote">' + reviewStore[i].quote + '</div><div id="critic">' + reviewStore[i].critic + '</div><div id="publication">' + reviewStore[i].publication + '</div><div id="date">' + reviewStore[i].date + '</div><div id="rLabel">' + answer.label.toUpperCase() + answer.value.toFixed(2) + '</div><br>');
                if (answer.label == "positive") {
                    count++;
                    $('#reviewResult').append('<div id="listgreen"><div id="quote">' + reviewStore[i].quote + '</div><div id="rLabel"> | ' + answer.value.toFixed(2) + '</div><div id="publication"> | ' + reviewStore[i].publication + '</div><div id="critic">- ' + reviewStore[i].critic + '</div></div><br>');
                } else
                    $('#reviewResult').append('<div id="listred"><div id="quote">' + reviewStore[i].quote + '</div><div id="rLabel"> | ' + answer.value.toFixed(2) + '</div><div id="publication"> | ' + reviewStore[i].publication + '</div><div id="critic">- ' + reviewStore[i].critic + '</div></div><br>');
                total++;
            }
        }
        $('#reviewResult').prepend('<div id="summary">' + ((100 * count) / total).toFixed(1) + "% POSITIVE | " + ((100 * (total - count)) / total).toFixed(1) + "% NEGATIVE</div>");
        reviewStore.length = 0;
    }
    $('#review').hide();
}

function test() {
    var negtest, postest, correct = 0,
        incorrect = 0,
        accuracy;
    $('#testResult').html("Testing"); //Doesnt show
    console.log("test start");

    for (i = pivot; i < negatives.length; i++) {
        negtest = guess(negatives[i]);
        postest = guess(positives[i]);

        if (negtest.value > 0.8)
            if (negtest.label == "negative")
                correct++;
            else
                incorrect++;
        if (postest.value > 0.8)
            if (postest.label == "positive")
                correct++;
            else
                incorrect++;
    }

    accuracy = Math.round(1000 * correct / (correct + incorrect)) / 10;
    console.log("test end");
    //	$('#testResult').empty();
    $('#testResult').html("Analyzer Accuracy: " + accuracy + "%");
}

function unique(text) {
    var result = [];
    $.each(text, function (key, value) {
        if ($.inArray(value, result) == -1)
            result.push(value);
    });
    return result;
}

function tokenize(text) {
    text = text.toLowerCase().replace(/\W/g, ' ').replace(/\s+/g, ' ').trim().split(' '); //	 \W-non word character, \s-white space character, + for consecutive characters replaced by single modifier, /g- look globally; all of the matches
    //text = unique(text);
    for (var i = 0; i < text.length; i++) {
        if (text[i].match(negation)) {
            if (text[i - 1] != null)
            //	if(text[i-1][0] != '~')
                text[i - 1] = "~" + text[i - 1];
            if (text[i + 1] != null)
            //	if(text[i+1][0] != '~')
                text[i + 1] = "~" + text[i + 1];
        }
    }
    text = text.map(function (word) {
        return stemmer(word);
    });
    return text;
};

function searchWord(word, array) {
    for (var i = 0; i < array.length; i++) {
        if (word == array[i].name) {
            return i;
        }
    }
    return -1;
}

function updateLabel(label) {
    var index = searchWord(label, labels);
    if (index == -1)
        labels.push({
            name: label,
            docCount: 1
        });
    else
        labels[index].docCount++;
}

function updateWords(text, label) {
    var i, index;
    var token = tokenize(text);
    for (i = 0; i < token.length; i++) {
        index = searchWord(token[i], words);
        if (index == -1)
            words.push({
                name: token[i],
                sentiment: label,
                count: 1
            });
        else {
            if (words[index].sentiment == label)
                words[index].count++;
            else
                words.push({
                    name: token[i],
                    sentiment: label,
                    count: 1
                });
        }
    }
}

function train(text, label) {
    updateLabel(label);
    updateWords(text, label);
};

function totalDocCount() {
    var total = 0;
    for (var i = 0; i < labels.length; i++)
        total += labels[i].docCount;
    return total;
}

function docInverseCount(index) {
    var total = totalDocCount();
    //	console.log(total);
    return (total - labels[index].docCount);
}

function totalCount(word) {
    var total = 0;
    for (var i = 0; i < words.length; i++)
        if (word == words[i].name)
            total += words[i].count;
    return total;
}

function labelCount(word, label) {
    var total = 0;
    for (var i = 0; i < words.length; i++)
        if ((word == words[i].name) && (label == words[i].sentiment))
            total += words[i].count;
    return total;
}

function labelInverseCount(word, label) {
    var total = 0;
    for (var i = 0; i < words.length; i++)
        if ((word == words[i].name) && (label != words[i].sentiment))
            total += words[i].count;
    return total;
}

function getWinner() {
    var max = 0,
        maxLabel;
    for (var i = 0; i < probability.length; i++) {
        if (probability[i].value > max) {
            max = probability[i].value;
            maxLabel = probability[i].name;
        }
    }
    return {
        label: maxLabel,
        value: max
    };
}

function guess(input) {
    if (input == "")
        return -1;
    else {
        var phrase = tokenize(input);
        //	console.log(phrase);
        var totalcount, word;
        for (var i = 0; i < labels.length; i++) {
            var label = labels[i].name;
            var doccount = labels[i].docCount;
            var docinversecount = docInverseCount(i);
            var num = 1,
                temp, den = 1,
                Sum = 0;

            for (var j = 0; j < phrase.length; j++) {
                word = phrase[j];
                totalcount = totalCount(word);
                if (totalcount <= 3)
                    continue;
                else {
                    var wordLabelProb = labelCount(word, label) / doccount;
                    var wordInverseLabelProb = labelInverseCount(word, label) / docinversecount;
                    var wordProb = wordLabelProb / (wordLabelProb + wordInverseLabelProb);

                    if (wordProb === 1)
                        wordProb = 0.99;
                    else if (wordProb === 0)
                        wordProb = 0.01;
                    //	console.log(word, wordLabelProb, wordInverseLabelProb);


                    Sum += (Math.log(1 - wordProb) - Math.log(wordProb));
                }
            }
            temp = (1 / (1 + Math.exp(Sum)));
            //      temp = num / (num + den);            
            probability.push({
                name: label,
                value: temp
            });
            console.log(label, temp);
        }

        var result = getWinner();
        probability.length = 0;
        return result;
    }
}
