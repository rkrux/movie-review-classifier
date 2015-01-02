
var need = "m7fmx6pgmrmny8qbe8qssxzd";
var baseUrl = "http://api.rottentomatoes.com/api/public/v1.0";
var movieStore = [], reviewStore = [];

$(document).ready(function() {
    var moviesSearchUrl = baseUrl + "/movies.json?apikey=" + need;
/*	var target = document.getElementById('spin');
	var spinner;
	var opts = {
            lines: 10, // The number of lines to draw
            length: 7, // The length of each line
            width: 4, // The line thickness
            radius: 10, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            color: '#000', // #rgb or #rrggbb
            speed: 1, // Rounds per second
            trail: 60, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: 25, // Top position relative to parent in px
            left: 25 // Left position relative to parent in px
        }; */
   
   $( '#findMovie' ).click(function(){
	//	spinner = new Spinner(opts).spin(target);
		$('#left').empty(); $('#middle').empty(); $('#right').empty(); $('#summary').empty();
		var term = $('#inputMovie').val();
		if(term != ""){
            $.ajax({
                url: moviesSearchUrl  + "&q=" + encodeURI(term),
                dataType: "jsonp",
                success: searchCallbackMovies
            }).error(function() {
				alert("Psst! No movie found!");
			});
		//	spinner.stop(target);
		}
		else
			alert("Psst! Enter a movie name.");
    });
})

function searchCallbackMovies(data) {
	//console.log(data);
	if(data.total == 0){
		alert("Psst! Enter a valid movie name.");
		return;
	}
		
    var movies = data.movies;
    var moviesUl = $('div#left');
	movieStore =[];
    moviesUl.empty();    
	$.each(movies, function(index, movie) {
		movieStore.push(movie.title);      
	});  
	var index =	compareTitle();
	//console.log(index);
	//ADD INDEX CHECK
	var critics_score = '-', critics_rating = " ";
	if(movies[index].ratings.critics_score != -1){
		critics_score = movies[index].ratings.critics_score;
		critics_rating += movies[index].ratings.critics_rating;
	}
	
	
	var castarray = "";
	$.each(movies[index].abridged_cast, function(index, val) {
			castarray += val.name;
			if(val.characters)														
				castarray += " as " + val.characters[0];
			castarray += ", ";
		});
	//castarray = castarray.slice(0, -1);
	moviesUl.append('<div id="thumbnail"> <img src="' + movies[index].posters.detailed + '" height="150" width="100" border="1"></img></div><div id="name"><a href="' + movies[index].links.alternate + '" target="_blank">' + movies[index].title + '</a></div><div id="year">'+ movies[index].year + ' | ' + movies[index].runtime + " mins" + '</div><div id="audience">' + movies[index].ratings.audience_score + ' ' + movies[index].ratings.audience_rating + '</div><div id="critics">' + critics_score + ' ' + critics_rating + '</div><div id="mpr">' + movies[index].mpaa_rating + '</div><div id="cast">'+ castarray +  '</div><br><div id="syn">'+ movies[index].synopsis +  '</div>');	
	
	reviewStore.length =0;
	getReviews(movies[index].links.reviews);
}

function compareTitle(){
	for(var i=0; i< movieStore.length; i++){
//		console.log(movieStore[i]);
		if(movieStore[i].toUpperCase() == $('#inputMovie').val().toUpperCase()){   //upper for case insensitive comparison
			//console.log(movieStore[i]);
			return i;
		}
	}
	return 0;
}

function getReviews(link){
	var reviewsSearchUrl = link + "?apikey=" + need;
            $.ajax({
                url: reviewsSearchUrl,
                dataType: "jsonp",
                success: searchCallbackReviews
            }).error(function() {
				alert("Psst! Reviews data not found from Server.");
			});
}

function searchCallbackReviews(data){
	//console.log(data);
	var reviews = data.reviews;
	for(var i=0;i< reviews.length; i++)
		reviewStore.push({quote: reviews[i].quote, critic: reviews[i].critic, date: reviews[i].date, publication: reviews[i].publication});
	makeReview();
}

function makeReview() {
    var count = 0, total = 0, neutral = 0, mid;
	
    if (reviewStore.length == 0)
        alert("Psst! No reviews found for the movie.");
    else{
		if((reviewStore.length % 2) == 1)
			mid = (reviewStore.length / 2) + 0.5;
		else
			mid = (reviewStore.length / 2);
			
        for (i=0; i < mid; i++){
            phrase = reviewStore[i].quote;
            answer = guess(phrase);
			var critic = (reviewStore[i].critic == "") ? "" : (reviewStore[i].critic + " | ");
			var publication = (reviewStore[i].publication == "") ? "" : (reviewStore[i].publication + " | ");
            var date = (reviewStore[i].date == "") ? "" : (reviewStore[i].date);
			
			if(answer != -1){
                if (answer.label == "neutral"){
					neutral++;
					$('#middle').append('<div id="listneutral">' + reviewStore[i].quote + ' | <b>' + critic + publication + answer.value.toFixed(2) +  ' | ' + date + '</b></div>');
				}
				else if (answer.label == "positive"){
                    count++;
                    $('#middle').append('<div id="listgreen">' + reviewStore[i].quote + ' | <b>' + critic + publication + answer.value.toFixed(2) +  ' | ' + date + '</b></div>');
				}
				else
                    $('#middle').append('<div id="listred">' + reviewStore[i].quote + ' | <b>' + critic + publication + answer.value.toFixed(2) +   ' | ' + date +  '</b></div>');
				total++;
            }
			else
				$('#middle').append('<div id="listneutral">Sorry, no quote available. | <b>' + critic + publication + date + '</b></div>');
			//$('#middle').append('<br>');
        }
		
		for (i=mid; i < (reviewStore.length); i++){
            phrase = reviewStore[i].quote;
            answer = guess(phrase);
			var critic = (reviewStore[i].critic == "") ? "" : (reviewStore[i].critic + " | ");
			var publication = (reviewStore[i].publication == "") ? "" : (reviewStore[i].publication + " | ");
            var date = (reviewStore[i].date == "") ? "" : (reviewStore[i].date);
			
			if(answer != -1){
                if (answer.label == "neutral"){
					neutral++;
					$('#right').append('<div id="listneutral">' + reviewStore[i].quote + ' | <b>' + critic + publication + answer.value.toFixed(2) +  ' | ' + date + '</b></div>');
				}
				else if (answer.label == "positive"){
                    count++;
                    $('#right').append('<div id="listgreen">' + reviewStore[i].quote + ' | <b>' + critic + publication + answer.value.toFixed(2) +   ' | ' + date +  '</b></div>');
				}
				else
                    $('#right').append('<div id="listred">' + reviewStore[i].quote + ' | <b>' + critic + publication + answer.value.toFixed(2) +   ' | ' + date +  '</b></div>');
				total++;
            }
			else
				$('#right').append('<div id="listneutral">Sorry, no quote available. | <b>' + critic + publication + date + '</b></div>');
			//$('#right').append('<br>');
        }
		
		var neutralData = (neutral > 0) ? (" | " + ((100 * neutral) / total).toFixed(1) + "% NEUTRAL") : "";
		if(total > 0)
			$('#summary').html('<div id="summary">' + ((100 * count) / total).toFixed(1) + "% POSITIVE | " + ((100 * (total - count - neutral)) / total).toFixed(1) + "% NEGATIVE" +  neutralData + '</div>');
        else
			$('#summary').html('<div id="summary">No quotes in the reviews found!</div>');
		
		reviewStore.length = 0;
    }
}