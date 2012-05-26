var map;
var geocoder;
var markers;
var infowindow;
var todayEvents;
var today;
var eventsHTML = "";
var currentPos;
 
var youAreHereMarker;


var universalLoader = " \
<div id='loadercircle' class='marginLeft'> \
					<div id='circle_1' class='circle'></div> \
					<div id='circle_2' class='circle'></div> \
					<div id='circle_3' class='circle'></div> \
					<div class='clearfix'></div> \
				</div>                      ";
                         
jQuery(document).ready(function() {
    
    getWeatherData();    
    
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
        $("#description").remove();
        $("#title").addClass("span2").removeClass("span6");
        
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
    $("#title").addClass("span6").removeClass("span2");
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
    var tomorrow = moment(today).add('hours', 36);
    //jsonURL = "http://betherenyc.herokuapp.com/api/search";
    jsonURL = "/api/search";
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
                    //events.forEach(function(element, index, array){
                      for(var p=0; p< events.length; p++){  
                        if (moment(events[p].datetime.endtimestamp) >= today && moment(events[p].datetime.endtimestamp) <= tomorrow && events[p].datetime.endtimestamp != null){
                            
                            if (moment(events[p].datetime.starttimestamp) < today ){
                                //it's happening now!
                                //build the html
                            eventsHTML = "\
                                <li map-lat='"+events[p].location.latitude+"' \
                                map-lng='"+events[p].location.longitude+"' \
                                event-name='"+events[p].name+"' \
                                event-place='"+events[p].location.placename+"' \
                                event-time='"+events[p].datetime.starttimestamp+"' \
                                event-id='"+events[p]._id+"'>\
                                <a modal-link='/api/event/"+events[p]._id+"'> \
                                    <h3>"+events[p].name+"</h3> \
                                    <p>"+events[p].place+"<br/> \
				    <span>happening now!</span><br/> \
				</a> \
				</li>" + eventsHTML;
                            }
                            else{
                            
                            //build the html
                            eventsHTML = eventsHTML + "\
                                <li map-lat='"+events[p].location.latitude+"' \
                                map-lng='"+events[p].location.longitude+"' \
                                event-name='"+events[p].name+"' \
                                event-place='"+events[p].location.placename+"' \
                                event-time='"+events[p].datetime.starttimestamp+"' \
                                event-id='"+events[p]._id+"'>\
                                <a modal-link='/api/event/"+events[p]._id+"'> \
                                    <h3>"+events[p].name+"</h3> \
                                    <p>"+events[p].location.placename+"<br/> \
				    <span>"+moment(new Date(events[p].datetime.starttimestamp)).calendar()+"</span><br/> \
				</a> \
				</li>" ;
                            }
                            todayEvents.push(events[p]);

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
                    
                    //if event started already
                    if (moment(data.event.datetime.starttimestamp) < today){
                        var timetext = "ends " +moment(new Date(data.event.datetime.endtimestamp)).fromNow();
                    }else{
                        var timetext = moment(new Date(data.event.datetime.starttimestamp)).fromNow();
                    }
                    //descr = data.descr;
                    var currentPos = localStorage.getItem("yourLocation").split(",");
                    console.log(currentPos[0]);
                    
                    if (currentPos[0] != ""){
                        var text = calculateDistance(currentPos[0], currentPos[1], data.event.location.latitude, data.event.location.longitude)+"mi";
                    }else{
                        var text = "";
                    }
                    console.log(currentPos);
                    var contentString = '<div id="content">'+
                        '<div id="siteNotice">'+
                        '</div>'+
                        '<div id="bodyContent"><p><strong>'+data.event.name+'</strong></p>'+
                        '<p style="color:darkmagenta"><i>'+timetext+
                        '</i> <span style="float:right">'+text+'</span></p>'+
                        '<p>'+data.event.desc.substr(0, 200) +'...'+
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


function getWeatherData(){
    //var jsonURL = "http://weather.yahooapis.com/forecastjson?w=2459115&callback=gotWeatherData";
    var jsonURL = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%3D2459115&format=json&diagnostics=true&callback=cbfunc";
        $.getJSON(jsonURL, function(data) {
  console.log( data );
  var img = data.condition.image;
                    var imgcode = "<img src="+img+"/>";
                    $("#logo").append(imgcode);
});
}
function gotWeatherData(json){
    console.log("got json back!");
                    var img = json.condition.image;
                    var imgcode = "<img src="+img+"/>";
                    $("#logo").append(imgcode);
               
    
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

function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = (lat2-lat1).toRad();
  console.log("dLAT = "+dLat);
  
  if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
    }
  }
  
  var dLon = (lon2-lon1).toRad();
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos((lat1* Math.PI / 180).toRad()) * Math.cos((lat2* Math.PI / 180).toRad()) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c * 0.621371192;// km to mi
  
  return d.toFixed(1);
}
/** Converts numeric degrees to radians */
if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}