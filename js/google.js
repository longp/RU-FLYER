$(document).ready(function() {

  $("#Search").on("click", function(e){
    e.preventDefault()
    var searchInput = $("#searchInput").val();
    var googleMapApiUrl = "https://maps.googleapis.com/maps/api/geocode/json?";
    googleMapApiUrl += "key=AIzaSyB2ydElm5o0fxXmBoxQRQFUa3yiqknBnc0";
    googleMapApiUrl += "&address=" + searchInput;
    $.ajax({
      type:"GET",
      url:googleMapApiUrl,
       success: function (response){
        var googleGeoLocation = response.results[0].geometry.location;
          format:"json",
          nojsoncallback:1,
          lat: googleGeoLocation.lat
          lon: googleGeoLocation,lng
        }
         console.log(googleGeoLocation);
       }
    });
  });
});
