
var need = "m7fmx6pgmrmny8qbe8qssxzd";
var baseUrl = "http://api.rottentomatoes.com/api/public/v1.0";
var movieStore = [];

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
		$('#review').show();
		$('#reviewResult').empty();
		$('#result').empty();
		var term = $('#inputMovie').val();
		if(term != ""){
            $.ajax({
                url: moviesSearchUrl  + "&q=" + encodeURI(term),
                dataType: "jsonp",
                success: searchCallbackMovies
            }).error(function() {
				$('div#result').html("<div id='quote'> No movie found. </div>");
			});
		//	spinner.stop(target);
		}
		else
			$('#reviewResult').html("<div id='quote'> Psst! Enter a movie name. </div>");
    });
})

function searchCallbackMovies(data) {
	console.log(data);
	if(data.total == 0){
		$('#reviewResult').html("<div id='quote'> Psst! Enter a valid movie name. </div>");
		return;
	}
		
    var movies = data.movies;
    var moviesUl = $('div#result');
	movieStore =[];
    moviesUl.empty();   
	
	$.each(movies, function(index, movie) {
		movieStore.push(movie.title);      
	});  
	var index =	compareTitle();
	console.log(index);
	
	var critics_score = '-', critics_rating = " ";
	if(movies[index].ratings.critics_score != -1){
		critics_score = movies[index].ratings.critics_score;
		critics_rating += movies[index].ratings.critics_rating;
	}
	
	
	var castarray = "";
	$.each(movies[index].abridged_cast, function(index, val) {
			castarray += val.name;
			if(val.characters.length > 0)															//Problem?
				castarray += " as " + val.characters[0];
			castarray += ", ";
		});
		
	moviesUl.append('<div id="thumbnail"> <img src="' + movies[index].posters.detailed + '" border="1"></img></div>' + '<div id="name"><a href="' + movies[index].links.alternate + '" target="_blank">' + movies[index].title + '</a></div><div id="year">'+ movies[index].year + '</div><div id="runtime">' + movies[index].runtime + "mins" + '</div><div id="audience">' + movies[index].ratings.audience_score + " " + movies[index].ratings.audience_rating + '</div><div id="critics">' + critics_score + critics_rating + '</div><div id="cast">'+ castarray +  '</div><div id="syn">'+ movies[index].synopsis +  '</div>');	
	
	reviewStore.length =0;
	getReviews(movies[index].links.reviews);
}

function compareTitle(){
	for(var i=0; i< movieStore.length; i++){
//		console.log(movieStore[i]);
		if(movieStore[i].toUpperCase() == $('#inputMovie').val().toUpperCase()){   //upper for case insensitive comparison
			console.log(movieStore[i]);
			return i;
		}
	}
	return 0;
}

function getReviews(link){ 
//	var reviewsSearchUrl = baseUrl + '/movies/' + link + 'reviews.json?apikey=' + need;  			//Doesn't work
	var reviewsSearchUrl = link + "?apikey=" + need;
            $.ajax({
                url: reviewsSearchUrl,
                dataType: "jsonp",
                success: searchCallbackReviews
            }).error(function() {
				$('div#result').html("Reviews data not found from Server");
			});
}

function searchCallbackReviews(data){
	console.log(data);
	var reviews = data.reviews;
	for(var i=0;i< reviews.length; i++)
		reviewStore.push({quote: reviews[i].quote, critic: reviews[i].critic, date: reviews[i].date, publication: reviews[i].publication});
}