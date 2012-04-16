var map;

  jQuery(document).ready(function() {

    //init modal window for event info
    jQuery("#myModal").dialog({
		autoOpen: false,
		show: "blind",
		hide: "blind",
		height: 240,
		modal: true
	});
    
    //append a clink function to each event link
    jQuery(".homeModalLink").each(function(){
        $(this).click(function () {
            console.log("im clicked");
            getThisEvent($(this).attr('modal-link'));
            
        });
        
    });

	    initialize();
	    
            jQuery('#eventName').change(function(e){
                var currentTitle = jQuery(this).val();
                jQuery("#urlslug").val(convertToSlug(currentTitle));

            });
	    
	    jQuery("#recentlyAdded h3").click(function(){
		console.log("I'm clicked!");
		JQuery(this).siblings("div").toggleClass("hidden");
	    });
            
            jQuery("#loadmore").click(function(){
                
            });

}); //end document ready


var getThisEvent = function(eventAPILink) {
    
    console.log("eventAPILink: "+eventAPILink);
    
    var jsonURL = eventAPILink;
     
    jQuery.ajax({
        
        url : jsonURL,
        dataType : 'json',
        type : 'GET',
        
        success : function(data) {
            console.log("inside success callback");
            console.log(data);
            if (data.status == "OK") {
                event = data.event;
                
                //launchModal(event);
            }
        },
        error : function(err) {
            console.log("error fetching this event");
        }

    }); // end of jQuery.ajax*/
} // end of getThisEvent


var launchModal = function(event) {
    
    console.log("inside launchmodal callback");
    
    // newHTML will be populated with html and appended to the 
    newHTML = "";
    
    newHTML = "<p>"+ event.date +", "+ event.time +"\
              <br/>"+ event.place +" \
              "+ event.desc.substr(0, 200) +"...\
              <a href=/events/permalink/"+ event._id +">Full Description</a>";
    
    //append new html to the DOM (browser's rendered HTML)
    jQuery("#modalInfo").html(newHTML);
    jQuery("#modalInfo").dialog({
		autoOpen: false,
		show: "blind",
		hide: "blind",
                width: 500,
		height: 440,
		modal: true,
                title: event.name
	});
    $("#modalInfo").dialog('open');

}

var interval = 20; //20 events at a time
var getMoreEvents = function() {    

    console.log("eventAPILink: "+eventAPILink);
    
    var jsonURL = "http://localhost:5000/api/allevents/";
     
    jQuery.ajax({
        
        url : jsonURL,
        dataType : 'json',
        type : 'GET',
        
        success : function(data) {
            console.log("inside success callback");
            console.log(data);
            if (data.status == "OK") {

                events = data.events[interval-1];                
                showMore(events, interval);
            }
        },
        error : function(err) {
            console.log("error fetching this event");
        }

    }); // end of jQuery.ajax*/
} // end of getThisEvent

var showMore = function(events, index){
    for (var j = 0; j < 20; j++){
        
    }
}

function convertToSlug(Text)
{
    return Text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;
}

      
        



//initialize the map on the home page
function initialize() {
    console.log("Starting map");
    var myOptions = {
          center: new google.maps.LatLng(40.7746431, -73.9701962),
          zoom: 11,
          mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map"), myOptions);
    
    var markers = [];
    
    $("#today-events li").each(function(){
        
        var thisLat = $(this).attr("map-lat");
        var thisLng = $(this).attr("map-lng");
        var thisName = $(this).attr("event-name");
        var thisTime = $(this).attr("event-time");
        
         var contentString = '<strong>'+thisName+'</strong><br/>'+thisTime;
        
        var infowindow = new google.maps.InfoWindow({
            content: contentString,
            maxWidth: 200
        });
        
        var thisLatlng = new google.maps.LatLng(thisLat,thisLng);
        var marker = new google.maps.Marker({
            position: thisLatlng, 
            map: map,
            animation: google.maps.Animation.DROP,
            title:"Hello World!"
        });
        
        google.maps.event.addListener(marker, 'click', function() {
            
            for (i = 0; i < markers.length; i++){
                markers[i].infowindow.close();
            }
            infowindow.open(map,marker);
        });
        
        var newObj = {
            name: thisName,
            lat: thisLat,
            lng: thisLng,
            marker: marker,
            infowindow : infowindow
        }
        markers.push(newObj);
    });//end each
    
    //remove markers when you click elsewhere
    google.maps.event.addListener(map, 'click', function(){
        for (i = 0; i < markers.length; i++){
                markers[i].infowindow.close();
            }
    });
    

}//end initialize()

function toggleBounce() {

    if (marker.getAnimation() != null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}

function showMarker(e){
    console.log("hmmm "+e);
}



//geocode address and place them on the map
  function codeAddress() {
    var address = document.getElementById("address").value;
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
            map: map, 
            position: results[0].geometry.location
        });
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
  }
