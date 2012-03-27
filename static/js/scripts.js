  jQuery(document).ready(function() {

    //init modal window for event info
    jQuery("#myModal").dialog({
		autoOpen: false,
		show: "blind",
		hide: "blind",
		height: 240,
		modal: true
	});
    

    $("#launchModal").click(function () {
	console.log("im clicked");
	$("#myModal").dialog('open');
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
	    })

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
} // end of getBlogPosts


var launchModal = function(event) {
    
    console.log("inside launchmodal callback");
    
    // newHTML will be populated with html and appended to the 
    newHTML = "";
    
    newHTML = "<p>"+ event.date +", "+ event.time +"\
              <br/>"+ event.place +"</p>\
              <p>"+ event.desc.substr(0, 200) +"...</p>\
              <p><a href=/events/"+ event.urlslug +">Full Description</a>";
    
    
     //   var tmpHTML = "<li><a href='/entry/"+ currentPost.urlslug +"'>"+currentPost.title+"</a></li>";
        
        // concatenate tmpHTML to the main html string newHTML
      //  newHTML += tmpHTML;
  
    
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
