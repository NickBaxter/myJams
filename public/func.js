var list;
var userInfo;

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
  /*for(var i = 0; i < songList.items.length; i++) {
    console.log(songList.items[i].uri);
  }*/
  list = songList;
}

function returnList() {

  var userProfileSource = document.getElementById('user-profile-template').innerHTML,
      userProfileTemplate = Handlebars.compile(userProfileSource),
      userProfilePlaceholder = document.getElementById('user-profile');

  var params = getHashParams();

  var access_token = params.access_token,
      refresh_token = params.refresh_token,
      error = params.error;

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
            userProfilePlaceholder.innerHTML = userProfileTemplate(response);
            console.log(response);
            setSongList(response);
          }
      });                  
    }
    else {
      // render initial screen
      $('#login').show();
      $('#loggedin').hide();
    }
  }  
}

function returnUserInfo() { 
  var params = getHashParams();
  var access_token = params.access_token,
      refresh_token = params.refresh_token,
      error = params.error;

  if (error) {
    alert('There was an error trying to the user information');
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
          }
      });                  
    }
    else {
      alert('No access token found. Trying logging back in');
    }
  }
}

function createPlaylist() {
  var params = getHashParams();
  var access_token = params.access_token,
      refresh_token = params.refresh_token,
      error = params.error;

  var playlistName = document.getElementById("playlistName").value;

  if(error) {
    alert("There was an error." + error);
  }
  else {
    if(access_token) {
      $.ajax({
        type: 'POST',
        url: 'https://api.spotify.com/v1/users/' + userInfo.id + '/playlists',
        data: JSON.stringify({
          name: playlistName,
          public: false
        }),
        dataType: 'json', 
        headers: {
          'Authorization': 'Bearer ' + access_token,
          'Content-Type': 'application/json'
        },
        success: function(response) {
          populatePlaylist(response);
        },
        error: function(jqXHR, exception) {
          console.log(jqXHR.responseJSON.error);
        } 
      });
      //todo: call function to populate playlist
    }
  }
}

function populatePlaylist(playlist) {
  //Loads the songs' data into a json object to be passed to the server call.
  //declares song list
  var array = [];
  var songList = {
    uris: []
  };

  //sets the array inside the json object to the song's uris to be added to the playlist.
  for(var i = 0; i < list.items.length; i++) {
    array[i] = list.items[i].uri;
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
        console.log(response);
      },
      error: function(jqXHR, exception) {
        console.log(jqXHR.responseJSON.error);
      }
    });
  }
}