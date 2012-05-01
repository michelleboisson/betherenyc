var map;
var geocoder;
var markers;
var infowindow;
var todayEvents;
var today;
var eventsHTML = "";
var currentPos;

var youAreHereMarker;

jQuery(document).ready(function() {

    geocoder = new google.maps.Geocoder();

    if ( $('#mapHome')[0] ){
        initializeHomeMap();
    }
    if ( $("#mapEvent")[0] ){
        initializeOneMap();
    }
    getPosition();
    getTodaysEvents();
    
    infowindow= new google.maps.InfoWindow({
        maxWidth: 200
    });

    $(".momentFromNow").each(function(){
        $(this).html(moment(new Date($(this).html())).fromNow());
    });
    $(".convertToMoment").each(function(){
        //var newdate = moment(new Date($(this).html()));
        //newdate.format("dddd, MMMM Do YYYY, h:mm a");
        $(this).html(moment(new Date($(this).html())).calendar());
        
    });
    
    //init modal window for event info
    jQuery("#myModal").dialog({
		autoOpen: false,
		show: "blind",
		hide: "blind",
		height: 240,
		modal: true
	});
	    
            jQuery('#eventName').change(function(e){
                var currentTitle = jQuery(this).val();
                jQuery("#urlslug").val(convertToSlug(currentTitle));

            });

}); //end document ready


/* Mobile Things! ------------------------- */

  
  if ($(window).width() < 767){
        console.log("mobile!");
      /*  var s = document.createElement("script");
        s.setAttribute("src", "http://code.jquery.com/mobile/1.1.0/jquery.mobile-1.1.0.min.js");
        s.setAttribute("id","jqueryMobileScript");
        document.body.appendChild(s);
      */
        $("#sidemenu").removeClass("span4");
        
        //open the marker window on click
        $("#today-events li").live('click', function(){
           var thisId = $(this).attr("event-id");
           var url = "/events/permalink/"+thisId;
           window.location = url;  
        });
        
        $("#showMap").click(function(){
            $("#mapHome").show();
            $("#sidemenu").hide();
        });
        $("#showList").click(function(){
            $("#mapHome").hide();
            $("#sidemenu").css('display','block');
        });

  }
  else {
    $("#jqueryMobileScript").remove();
    $("#sidemenu").addClass("span4");
  }
  



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

function convertToSlug(Text)
{
    return Text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;
}

      
        

//initialize the map on the home page
function initializeHomeMap() {
    console.log("Starting map");
    //setup map
    var myOptions = {
          center: new google.maps.LatLng(40.7746431, -73.9701962),
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        },
      panControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP
      },
      zoomControl: true,
      zoomControlOptions: {
          style: google.maps.ZoomControlStyle.LARGE,
          position: google.maps.ControlPosition.RIGHT_TOP
      },
      scaleControl: true,
      scaleControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP
      },
      streetViewControl: true,
      streetViewControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP
      }
    };
    map = new google.maps.Map(document.getElementById("mapHome"), myOptions);
    
    markers = [];
    
    youAreHereMarker = new google.maps.Marker({
        map: map,
        icon: "http://maps.google.com/mapfiles/marker_purple.png"
    });
    
}

function getTodaysEvents(){
    
    /* ----- Get Today's events ----*/
    todayEvents = [];
    today = moment();
    console.log("today", today.format());
    var tomorrow = moment(today).add('hours', 24);
    //jsonURL = "http://betherenyc.herokuapp.com/api/allevents/";
    jsonURL = "http://localhost:5000/api/allevents/";
    var eventsHTML = "";
    
    jQuery.ajax({
          
            url : jsonURL,
            dataType : 'json',
            type : 'GET',
            
            success : function(data) {
                console.log("inside success callback");
                
                if (data.status == "OK") {
                    
                    //save events
                    var events = data.events;
                    
                    //loop and find events happening between now and the next 24hrs
                    //save to todaysEvents array
                    for (var c=0; c < events.length; c++){
                        
                        if (moment(events[c].datetime.timestamp) >= today && events[c].datetime.timestamp != null){
                            todayEvents.push(events[c]);
                            
                            //build the html
                            eventsHTML = "\
                                <li map-lat='"+events[c].location.latitude+"' \
                                map-lng='"+events[c].location.longitude+"' \
                                event-name='"+events[c].name+"' \
                                event-place='"+events[c].place+"' \
                                event-time='"+events[c].datetime.timestamp+"' \
                                event-id='"+events[c]._id+"'>\
                                <a modal-link='/api/event/"+events[c]._id+"'> \
                                    <h3>"+events[c].name+"</h3> \
                                    <p>"+events[c].place+"<br/> \
				    <span>"+moment(events[c].datetime.timestamp).local().calendar()+"</span><br/> \
				</a> \
				</li>" + eventsHTML;

                        }
                    }
                    console.log("done");
                    
                    //push to the dom
                    $(".loading").remove();
                    $("#today-events").html(eventsHTML);
                    
                    //add markers for each event
                    todayEvents.forEach(function(element, index, array){
                        
                        var thisLat = element.location.latitude;
                        var thisLng = element.location.longitude;
                        var thisName = element.name;
                        var thisTime = element.datetime.timestamp;
                        var thisId = element._id;
                        
                        
                        var thisLatlng = new google.maps.LatLng(thisLat,thisLng);
                        var marker = new google.maps.Marker({
                            position: thisLatlng, 
                            map: map,
                            animation: google.maps.Animation.DROP,
                            title: thisId
                        });
                        
                        //add onclick event listener for the markers
                        google.maps.event.addListener(marker, 'click', function(){
                            openWindow(marker.title);
                        });
        
                        var newObj = {
                            name: thisName,
                            lat: thisLat,
                            lng: thisLng,
                            latlng: thisLatlng,
                            marker: marker
                            //infowindow : infowindow
                        }       
                        markers.push(newObj);
                        
                    }); //end for each event
                    
                }//end if status OK
            },
            error : function(err) {
                console.log("error fetching events");
            }
        
        }); // end of jQuery.ajax*/
    

    //focus on the corresponding marker on mouseover
    $("#today-events li").live('mouseover', function(){
        var thisId = $(this).attr("event-id");
        
        for (a = 0; a < markers.length; a++){
            var thisMarker = markers[a].marker;
            var latLng = new google.maps.LatLng(markers[a].lat, markers[a].lng);
             
            if (thisMarker.title == thisId){
                for(b=0;b<markers.length; b++){
                  //  markers[b].infowindow.close();
                }
                if (map.getBounds().contains(latLng) == false){
                    map.panTo(latLng);
                }
                thisMarker.setAnimation(google.maps.Animation.BOUNCE);
            } else{
                thisMarker.setAnimation(null);
            }
        }
        
    });
   
    //open the marker window on click
    $("#today-events li").live('click', function(){
        var thisId = $(this).attr("event-id");
        openWindow(thisId);  
    });

    //remove markers when you click elsewhere
    google.maps.event.addListener(map, 'click', function(){
        infowindow.close();
    });
    


}//end getTodaysEvents()

function openWindow(id){
     var jsonURL = "/api/event/"+id;
     console.log(jsonURL);
     
        jQuery.ajax({
          
            url : jsonURL,
            dataType : 'json',
            type : 'GET',
            
            success : function(data) {
                console.log("inside success callback");
                console.log(data);
                if (data.status == "OK") {
                    
                    //descr = data.descr;
                    var contentString = '<div id="content">'+
                        '<div id="siteNotice">'+
                        '</div>'+
                        '<div id="bodyContent"><strong>'+data.event.name+'</strong><br/><i>'+moment(data.event.datetime.timestamp).fromNow()+
                        '</i><p>'+data.event.desc.substr(0, 200) +'...'+
                        '<p><a href=/events/permalink/'+data.event._id+'>See event</a></p></div>'+
                        '</div>';
                        //launchModal(event);
                        
                        for (i = 0; i<markers.length; i++){
                            if (markers[i].marker.title == id ){
                                var thisMarker = markers[i].marker;
                                 infowindow.open(map);
                                 infowindow.setContent(contentString)
;                                 infowindow.setPosition(thisMarker.position);
                                thisMarker.setAnimation(null);
                            }
                        }
                        
                       
                        
                }
            },
            error : function(err) {
                console.log("error fetching this event");
            }
        
        }); // end of jQuery.ajax*/
}//end openWindow


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


function getPosition(){
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(function(currentPosition) {
      console.log("getting position");
      console.log(currentPosition);
      currentLat = currentPosition.coords.latitude;
      currentLong = currentPosition.coords.longitude;
      currentPos = currentLat+","+currentLong;
      //var targetLoc = localStorage.getItem("targetLoc");
      localStorage.setItem("yourLocation", currentPos);

      youAreHereMarker.setPosition(new google.maps.LatLng(currentPosition.coords.latitude,currentPosition.coords.longitude));
      
    //add onclick event listener for the markers
    google.maps.event.addListener(youAreHereMarker, 'click', function(){
        infowindow.open(map);
        infowindow.setContent("This is you!");
        infowindow.setPosition(youAreHereMarker.position);
    });
      map.panTo(youAreHereMarker.position);

        
      
    }, function(error){
      alert("Error occurred when watching. Error code: " + error);
    
    }, {enableHighAccuracy:true, maximumAge:30000, timeout:27000});
  }
  else {
    Alert('Geolocation is not supported for this Browser/OS version yet.');
  }
};

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
function lookUpLatLong(address){
  
  //http://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&sensor=true_or_false
  //json .status.geometry.location.lat, .status.geometry.location.lng
    console.log(address);
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        console.log(results);
        targetLat = results[0].geometry.location.Ya;
        targetLong = results[0].geometry.location.Za;        
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
}

function initializeOneMap(){
    console.log("init one event map");
    
    var thisEventLat = $("#mapEvent").attr("map-lat");
    var thisEventLng = $("#mapEvent").attr("map-lng");
    var thisEventLatLng = new google.maps.LatLng(thisEventLat,thisEventLng);
    
    var myOptions = {
          center: thisEventLatLng,
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        },
      panControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP
      },
      zoomControl: true,
      zoomControlOptions: {
          style: google.maps.ZoomControlStyle.LARGE,
          position: google.maps.ControlPosition.RIGHT_TOP
      },
      scaleControl: true,
      scaleControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP
      },
      streetViewControl: true,
      streetViewControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP
      }
    };
    var mapOne = new google.maps.Map(document.getElementById("mapEvent"), myOptions);
    
    var marker = new google.maps.Marker({
            position: thisEventLatLng, 
            map: mapOne,
            animation: google.maps.Animation.DROP
    });
}