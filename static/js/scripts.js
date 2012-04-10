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
                
                launchModal(event);
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
              <br/>"+ event.place +"</p>\
              <p>"+ event.desc.substr(0, 200) +"...</p>\
              <p><a href=/events/permalink/"+ event._id +">Full Description</a>";
    
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
    console.log("Staring map");
    geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(-34.397, 150.644);
    var myOptions = {
      zoom: 8,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(document.getElementById("map"), myOptions);
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
