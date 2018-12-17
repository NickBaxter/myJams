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
            userProfilePlaceholder.innerHTML = userProfileTemplate(response);
            console.log(response);
            setSongList(response);
          },
          error: function(jqXHR, exception) {
            console.log("jqXHR: " + jqXHR.responseJSON);
            console.log("exception: " +exception);
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

  var playlistName = document.getElementById("playlistName");
  var playlistPublic = document.getElementById("playlistPublic");
  var playlistColab = document.getElementById("playlistColab");
  var playlistDesc = document.getElementById("playlistDesc");

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
          public: playlistPublic.checked,
          collaborative: playlistColab.checked,
          description: playlistDesc.value
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

function openModal() {
  modal = document.getElementById("playlistModal");

  modal.style.display = "block";
}

//closes the popup when the page is clicked
window.onclick = function(event) {
  var modal = document.getElementById("playlistModal");
  var successModal = document.getElementById("successModal");

  if(modal.style.display == "block" || successModal.style.display == "block") {
    var playlistName = document.getElementById("playlistName");
    var playlistPublic = document.getElementById("playlistPublic");
    var playlistColab = document.getElementById("playlistColab");
    var playlistDesc = document.getElementById("playlistDesc");

    if (event.target == modal || event.target == successModal) {
        successModal.style.display = "none";
        modal.style.display = "none";
        playlistColab.checked = false;
        playlistPublic.checked = false;
        playlistName.value = "";
        playlistDesc.value = "";
    } 
  }
};

function openSuccessModal() {
  var modal = document.getElementById("playlistModal");
  var successModal = document.getElementById("successModal");

  modal.style.display = "none";
  successModal.style.display = "block";

}