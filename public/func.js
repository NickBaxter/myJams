var trackList = [];
var userInfo;
var pressTimer;

// Get IE or Edge browser version
var version = detectIE();
console.log("Browser Version: " + version);

class Track {
  constructor(info) {
    this.addToPlaylist = true;
    this.uri = info.uri;
    this.artist = info.artists[0].name;
    this.songName = info.name;
    this.albumArt = info.album.images[0].url;
  }

  setPlaylistStatus(status) {
    this.addToPlaylist = status;
  }

  getPlaylistStatus() {
    return this.addToPlaylist;
  }
}

function findTrack(uri) {
  for(var i = 0; i < trackList.length; i++) {
    if(trackList[i].uri == uri) {
      return trackList[i];
    }
  }
}

function onLoad() {6
  returnUserInfo();
  returnList();
}

function getHashParams() {
  var hashParams = {};
  var e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
  while ( e = r.exec(q)) {
     hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}

function setSongList(songList) {
  trackList = [];
  for(var i = 0; i < songList.items.length; i++) {
    var newTrack = new Track(songList.items[i]);
    trackList[i] = newTrack;
  }
  console.log("----Track List----");
  console.log(trackList);
}

/*
  When the search button gets clicked it fires this function that makes an API call and returns
  the list and then calls another function to set the list variable that's used to populate a playlist.
*/
function returnList() {
  var userProfileSource = document.getElementById('user-profile-template').innerHTML,
      userProfileTemplate = Handlebars.compile(userProfileSource),
      userProfilePlaceholder = document.getElementById('user-profile');

  var params = getHashParams();

  var access_token = params.access_token,
      refresh_token = params.refresh_token,
      error = params.error;

  if(document.getElementById("number").value > 50) {
    alert("50 is the maximum amount of song that will be returned.");
    document.getElementById("number").value = 50;
  }
  else if(document.getElementById("number").value < 0) {
    alert("You must at least enter 1 as the number of songs to return ya dingus");
    document.getElementById("number").value = 1;
  }

  if (error) {
    alert('There was an error during the authentication');
  } 
  else {
    if (access_token) {
      userProfilePlaceholder.innerHTML = userProfileTemplate("");
      var time_range = document.getElementById("timeRange").value;
      var limit = document.getElementById("number").value;

      $.ajax({
          url: 'https://api.spotify.com/v1/me/top/tracks?time_range=' + time_range + '&limit=' + limit,
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          success: function(response) {
            setSongList(response);
            //userProfilePlaceholder.innerHTML = userProfileTemplate(response);
            userProfilePlaceholder.innerHTML = userProfileTemplate(trackList);
            console.log(response);            
          },
          error: function(jqXHR, exception) { //if the access token is expired it ends up here.
            console.log("jqXHR: " + jqXHR.responseJSON);
            console.log("exception: " + exception);
          } 
      });                  
    }
    else {
      // render initial screen
      $('#login').show();
      $('#loggedIn').hide();
    }
  }  
}
/*
function refreshToken() {
  var params = getHashParams();

  var refresh_token = params.refresh_token;

  console.log("refresh_token!");
  $.ajax({
    url: '/refresh_token',
    data: {
      'refresh_token': refresh_token
    }
  });
}
*/
function returnUserInfo() { 
  var params = getHashParams();
  var access_token = params.access_token,
      refresh_token = params.refresh_token,
      error = params.error;

  if (error) {
    alert('There was an error trying to get the user information: ' + error);
  } 
  else {
    if (access_token) {
      $.ajax({
          url: 'https://api.spotify.com/v1/me',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          success: function(response) {
            console.log("-----------------User info------------------");
            console.log(response);
            userInfo = response;
            console.log("test 3");
          }
      });                  
    }
    else {
      //alert('No access token found. Trying logging back in');
    }
  }
}

function createPlaylist() {
  var params = getHashParams();
  var access_token = params.access_token,
      refresh_token = params.refresh_token,
      error = params.error;

  var today = new Date();
  var descSignature = " -This playlist was created by spotmyjams.com on " + (today.getMonth()+1) + "/" + today.getDate() + "/" + today.getFullYear(); //this signature gets added to the end of description. I tried to add a newline character, but spotify didn't seem to like it.

  var playlistName = document.getElementById("playlistName");
  var playlistPublic = document.getElementById("playlistPublic");
  var playlistColab = document.getElementById("playlistColab");
  var playlistDesc = document.getElementById("playlistDesc").value + descSignature;

  if(error) {
    alert("There was an error." + error);
  }
  else {
    if(access_token) {
      $.ajax({
        type: 'POST',
        url: 'https://api.spotify.com/v1/users/' + userInfo.id + '/playlists',
        data: JSON.stringify({
          name: playlistName.value,
          description: playlistDesc,
          public: playlistPublic.checked,
          collaborative: playlistColab.checked         
        }),
        dataType: 'json', 
        headers: {
          'Authorization': 'Bearer ' + access_token,
          'Content-Type': 'application/json'
        },
        success: function(response) {
          populatePlaylist(response);
          openSuccessModal();
        },
        error: function(jqXHR, exception) {
          console.log(jqXHR.responseJSON.error);
          alert(jqXHR.responseJSON.error.message);
        } 
      });
    }
  }
}

/*
  Adds the songs from the list to the playlist that has been passed in by
  loading the songs' data into a json object to be passed to the server call
*/
function populatePlaylist(playlist) {
  //declares song list
  var array = [];
  var songList = {
    uris: []
  };

  //sets the array inside the json object to the song's uris to be added to the playlist.
  for(var i = 0; i < trackList.length; i++) {
    if(trackList[i].addToPlaylist == true) {    
      array.push(trackList[i].uri);      
    }
  } 

  songList.uris = array;

  var params = getHashParams();
  var access_token = params.access_token,
      refresh_token = params.refresh_token,
      error = params.error;

  if(error) {
    alert("There was an error." + error);
  }
  else {
    $.ajax({
      type: 'POST',
      url: 'https://api.spotify.com/v1/playlists/' + playlist.id + '/tracks',
      data: JSON.stringify(songList),
      dataType: 'json',
      headers: {
        'Authorization': 'Bearer ' + access_token,
        'Content-Type': 'application/json'
      },
      success: function(response) {
        console.log("Playlist populated successfully");
      },
      error: function(jqXHR, exception) {
        console.log(jqXHR.responseJSON.error);
      }
    });
  }
}

function openPlaylistModal() {
  modal = document.getElementById("playlistModal");

  modal.style.display = "block";
}

function openSuccessModal() {
  var modal = document.getElementById("playlistModal");
  var successModal = document.getElementById("successModal");

  modal.style.display = "none";
  successModal.style.display = "block";
}

function openInstructionModal() {
  modal = document.getElementById("instructionModal");

  modal.style.display = "block";
}

//closes the popup when the page is clicked
window.onclick = function(event) {
  var playlistModal = document.getElementById("playlistModal");
  var successModal = document.getElementById("successModal");
  var instructionModal = document.getElementById("instructionModal")

  if(playlistModal.style.display == "block" || successModal.style.display == "block") {
    var playlistName = document.getElementById("playlistName");
    var playlistPublic = document.getElementById("playlistPublic");
    var playlistColab = document.getElementById("playlistColab");
    var playlistDesc = document.getElementById("playlistDesc");

    if (event.target == playlistModal || event.target == successModal) {
        successModal.style.display = "none";
        playlistModal.style.display = "none";
        playlistColab.checked = false;
        playlistPublic.checked = false;
        playlistName.value = "";
        playlistDesc.value = "";
    } 
  }
  else if(instructionModal.style.display == "block") {
        instructionModal.style.display = "none";
  }
};

function mouseDownEvent(obj, test) {
  var element = obj;
  var track;

  console.log("Click detected");

  if(isMobileDevice() == false) {
    console.log("not a mobile device");
    pressTimer = window.setTimeout(function() { 
      if(obj.style.opacity == "1" || obj.style.opacity == "") {
        obj.style.opacity = "0.2";
        track = findTrack(test);
        track.setPlaylistStatus(false);
      }
      else {
        obj.style.opacity = "1.0";
        track = findTrack(test);
        track.setPlaylistStatus(true);
      }
    },200);
  }
  else {
    console.log("it is a mobile device");
    if(obj.style.opacity == "1" || obj.style.opacity == "") {
        obj.style.opacity = "0.2";
        track = findTrack(test);
        track.setPlaylistStatus(false);
      }
      else {
        obj.style.opacity = "1.0";
        track = findTrack(test);
        track.setPlaylistStatus(true);
      }
  }
  obj.style.transform = "scale(.9)";
}

function mouseUpEvent(obj) {
  clearTimeout(pressTimer);
  obj.style.transform = "scale(1)";
}

function mouseOutEvent(obj) {
  obj.style.transform = "scale(1)";
}

function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};

/**
 * detect IE
 * returns version of IE or false, if browser is not Internet Explorer
 * code from https://codepen.io/gapcode/pen/vEJNZN
 */
function detectIE() {
  var ua = window.navigator.userAgent;

  var msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }

  var trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return version number
    var rv = ua.indexOf('rv:');
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }

  var edge = ua.indexOf('Edge/');
  if (edge > 0) {
    // Edge (IE 12+) => return version number
    return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
  }

  // other browser
  return false;
}