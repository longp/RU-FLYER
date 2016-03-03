$(document).ready(function() {

	$("#Search").on("click", function(e){
    e.preventDefault()
    var searchInput = $("#searchInput").val();
    var yelpApiUrl = "https://api.yelp.com/v2/search?";
    yelpApiUrl += "key=9s2HNnWDnRjz7sZB14Zcfw";
    yelpApiUrl += "&address=" + searchInput;
    $.ajax({
      type:"GET",
      url:yelpApiUrl,
       success: function (response){
        var yelpSearch = response.results[0];
        }
         console.log(yelpSearch);
       }
    });
  });
});