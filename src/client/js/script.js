/*
 * Connect song object to have album and artist objects
 */

$(document).ready(function() {
    var urlArray = (window.location.pathname).split("/");
    switch (urlArray[1]) {
        case "signup":
            signUpPage();
            break;
        case "signin":
            signInPage();
            break;
        case "home":
            homePage();
            break;
        case "party":
            var partyToken = urlArray[2];
            switch (urlArray[3]) {
                case undefined:
                    partyHomePage(partyToken);
                    break;
                case "search":
                    searchPage(partyToken);
                    break;
                default:
                    alert("cannot find this page!");
                    break;
            }
            break;
        default:
            alert("Cannot find: " + window.location.pathname);
            break;
    }
});

/* ------------------------------------------------------------------------ */
/* -------------------------- PAGE SPECIFIC CODE -------------------------- */
/* ------------------------------------------------------------------------ */

// PLAN !!!!!
// 1. move queue stuff to its own module
// 2. create endpoint to get currentlyPlaying song
// 3. write queue template stuff for home page

function partyHomePage(partyToken) {

    console.log("testeroonie")

    var socket = io.connect('http://localhost:8080');
    socket.on('update-queue', function (data) {
        $(".song-queue-item").remove();
        $(".now-playing-item").remove();
    });

    $(".show-more-button").click(function () {
        $(location).attr('href', "/party/" + partyToken + "/search");
    });


    $(".like-button").click(function() {
        console.log("yahoo")
    });

    $.ajax({
        type: "GET",
        url: "/party/" + partyToken + "/queue"
    }).done(function(data) {
        generateQueueContent(data);
    });

    $.ajax({
        type: "GET",
        url: "/party/" + partyToken + "/now-playing"
    }).done(function (data) {
        generateNowPlayingContent(data);
    });

    // $.ajax({
    //     type: "GET",
    //     url: "/party/" + partyToken + "/party-info"
    // }).done(function (data) {
    //     generatePartyInfoContent(data);
    // });
}

function generatePartyInfoContent(data) {
    if (data == undefined || data == null) return;
    // -- GENREATE PARTY INFO --
    var partyInfoTemplate = Handlebars.compile($("#party-info-template").html());
    var partyInfo = {
        PARTY_NAME : "Slug Rager",
        PARTY_OWNER : "Ryan Glenn",
    };
    var partyInfoHtml = partyInfoTemplate(partyInfo);
    $(".party-info-section").append(partyInfoHtml);
}

function generateNowPlayingContent(data) {
    if (data == undefined || data == null || data == "") return;
    var songWidth =  $(".content-party-connect").outerWidth();
    var nowPlayingTemplate = Handlebars.compile($("#now-playing-template").html());
    var artists = artistsToText(data);
    var nowPlayingInfo = {
        NAME: data.songName,
        ARTIST: artists,
        WIDTH: songWidth
    };

    var nowPlayingHtml = nowPlayingTemplate(nowPlayingInfo);
    $(".now-playing-section").append(nowPlayingHtml);
}

function generateQueueContent(queueInfo) {
    if (queueInfo == undefined || queueInfo == null || queueInfo.length == 0) return;
    var songTemplate = Handlebars.compile($("#song-template").html());
    var songWidth =  $(".content-party-connect").outerWidth();
    var boxSize = (78.22 - 10) / 2;
    //              = boxSize + song default padding + padding between + border
    var discrepancy = boxSize + 15 + 10 + 2;
    var songInfoWidth = songWidth - discrepancy;

    for (var i = 0; i < queueInfo.length; i++ ) {
        var artists = artistsToText(queueInfo[i]);
        var songInfo = {
            NAME: queueInfo[i].songName,
            ARTIST: artists,
            WIDTH_SONG: songInfoWidth,
            BOX_SIZE: boxSize,
            ID: queueInfo[i].songId
        };

        var songHtml = songTemplate(songInfo);
        $(".song-queue-list").append(songHtml);
        $("#song-" + songInfo.ID+" > div > .like-button").click(function(event){
            var path = event.view.window.location.pathname;
            path = path.split("/");
            var partyToken = path[2];
            var songId = songInfo.ID;
            $.ajax({
                type: "PUT",
                url: "/party/" + partyToken + "/vote",
                data: {
                    queueIndex: i-1,
                    isLike: true,
                }
            }).done(function(data) {
                //Here you kris
            });
        });

        $("#song-" + songInfo.ID+" > div > .dislike-button").click(function(event){
            var path = event.view.window.location.pathname;
            path = path.split("/");
            var partyToken = path[2];
            var songId = songInfo.ID;
            $.ajax({
                type: "PUT",
                url: "/party/" + partyToken + "/vote",
                data: {
                    songToUpdate: songId,
                    isLike: false,
                }
            }).done(function(data) {
                //Also for you kris
            });
        });

    }
}



/*
 * signup page: password length and username length control
 */
function signInPage() {
    console.log("SIGN IN PAGE");
    $("#login-form").submit(function(e) {
        e.preventDefault();
    });

    $("#login-button").click(function() {
        var username = $("#username-section").val();
        var password = $("#password-section").val();

        $.ajax({
            type: "PUT",
            url: "/account/sign-in",
            data: {
                username: username,
                password: password
            }
        }).done(function(data) {
            if (data.hasOwnProperty('error')){
                console.log("ERROR");
                console.log(data.error);
                throwLoginError(data.error);
                $("#password-section").val('');
            }
            else if(data.hasOwnProperty ('loginCode')) {
                var url = "/home";
                console.log("SUCCESS");
                console.log(data);
                $(location).attr('href',url);
            }
            else{
                var url = "/signin";
                $(location).attr('href',url);
            }
        });

    });
}


/*
 * signup page: password length and username length control
 */
function signUpPage() {

    console.log("SIGN UP PAGE");

    $("#signup-form").submit(function(e) {
        e.preventDefault();
    });


    $("#signup-button").click(function() {
        var username = $("#username-section").val();
        var password = $("#password-section").val();
        var passwordConf = $("#password-confirm-section").val();
        $.ajax({
            type: "PUT",
            url: "/account/sign-up",
            data: {
                username: username,
                password: password,
                passwordConf: passwordConf
            }
        }).done(function(data) {
            if (data.hasOwnProperty('error')){
                console.log("ERROR");
                console.log(data.error);
                throwLoginError(data.error);
                $("#password-section").val('');
                $("#password-confirm-section").val('');
            }
            else if(data.hasOwnProperty ('loginCode')){
                var url = "/home";
                console.log("SUCCESS");
                console.log(data);
                $(location).attr('href',url);
            }
            else{
                var url = "/signin";
                $(location).attr('href',url);
            }
        });
  });
}

/* Home Page */
function homePage() {
    console.log("HOME PAGE");


}

/* Search Page */
function searchPage(partyToken) {
    var width =  $(".content-box").outerWidth();
    $(".search-content").css("width", width+"px");
    $(".search-content").css("max-width", width+"px");

    $("#search-form").submit(function(e) {
        e.preventDefault();
    });

    $(".search-tab").click(function(){
        if (this != $(".search-curr")) {
            $(".search-curr").removeClass("search-curr");
            $("#" + this.id).addClass("search-curr");
            $(".search-section-cur").removeClass("search-section-cur");
            var section = "." + this.id.split("-")[0] + "-content";
            $(section).addClass("search-section-cur");
        }
    });

    $("#search-button").click(function() {
        var query = $("#search-query").val();
        var currentMaxResults = 5;

        $.ajax({
            type: "GET",
            url: "/search",
            data: {
                query: query,
                type: 'all'
            }
        }).done(function(data) {
            //TODO PRECOMPILE
            if (data.tracks == null)
                $("#song-error").text("ERROR").css("display", "block");
            else {
                if ($(".song-item") != null)
                    $(".song-item").remove();

                if ($("#show-more-song") != null)
                    $("#show-more-song").remove();

                if (data.tracks.length == 0)
                    $("#song-error").text("NO SONGS FOUND").css("display", "block");
                else
                    generateSongContent(currentMaxResults, data.tracks);
            }
        });
  });
}



// ASSUMES songData is not empty!
function generateSongContent(maxResults, songData) {
    var songTemplate = Handlebars.compile($("#song-item-template").html());
    var songWidth =  $(".content-box").outerWidth() - 16 - 45;

    var m = maxResults < songData.length ? maxResults : songData.length;
    for (var y = 0; y < m; y++) {
        var name = songData[y].songName;
        var artists = artistsToText(songData[y]);

        var songInfo = {
            NAME: name,
            ARTIST: artists,
            WIDTH: songWidth,
            SONG_ID: songData[y].songId
        };
        var songHtml = songTemplate(songInfo);
        $(".song-content").append(songHtml);
        $("#song-" + songInfo.SONG_ID).bind('click', {songInfo: songData[y]}, onSongClick);
    }

    if (maxResults < songData.length) {
        var viewMoreTemp = Handlebars.compile($("#show-more").html());
        var viewMoreHtml = viewMoreTemp({TEXT: "VIEW MORE SONGS", ID: "song"});
        $(".song-content").append(viewMoreHtml);
        $("#show-more-song").click(function() {
            $(".song-item").remove();
            $("#show-more-song").remove();
            generateSongContent(maxResults + 5, songData);
        });
    }
}


 var onSongClick = function(event) {
     var songInfo = event.data.songInfo;
     var songCoverTemp = Handlebars.compile($("#song-cover-temp").html());
     var artists = artistsToText(songInfo);
     var popUpInfo = {
        NAME: songInfo.songName,
        ARTIST: artists,
        ARTIST_ID: songInfo.artistId,
        ALBUM_NAME: songInfo.albumName,
        ALBUM_ID: songInfo.albumId,
        COVER_URL: songInfo.albumImage
    };
    var songCoverHtml = songCoverTemp(popUpInfo);
    $("body").addClass("body-cover");
    $("body").append(songCoverHtml);
    $(".song-cover").click(closeSongCover);
    $("#sc-queue").bind("click", {songInfo : songInfo}, queueSong);

    function closeSongCover(event) {
        if (event.target.className == "song-cover" ||
            event.target.id == "sc-close") {
                $("body").removeClass("body-cover");
                $(".song-cover").remove();
        }
    }

    function queueSong(event) {
        console.log("PATH");
        var path = event.view.window.location.pathname;
        path = path.split("/");
        var partyToken = path[2];
        console.log(event.data.songInfo);
        $.ajax({
            type: "PUT",
            url: "/party/" + partyToken + "/queue-song",
            data: {
                songInfo: JSON.stringify(event.data.songInfo),
                user: null,
            }
        }).done(function(data) {
            console.log("DONE");
            console.log(data);
        });
    }

};


function artistsToText(songData) {
    var artists = songData.songArtists[0].name.toUpperCase();
    for (var x = 1; x < songData.songArtists.length; x++) {
        artists = artists + ', ' +  songData.songArtists[x].name.toUpperCase() ;
    }
    return artists;
}

// SERVER JS SONG OBJECT NEEDS TO HAVE ALBUM ID, AND ARTISTS ID
function addSongClick(songInfo) {
    var viewMoreTemp = Handlebars.compile($("#song-" + songInfo.songId).html());
    var popUpInfo = {
        NAME: songInfo.songName,
        ARTIST: artistsToText(songInfo),
    };
    var viewMoreHtml = viewMoreTemp({TEXT: "VIEW MORE SONGS", ID: "song"});
}

/* ----------------------------------------------------------------------- */
/* -------------------------- GENERAL FUNCTIONS -------------------------- */
/* ----------------------------------------------------------------------- */

/*
 * Used to throw errors on sign up
 */
function throwLoginError(error) {
    var width =  $("#username-section").outerWidth() - 30;
    $(".client-error").css("width", width+"px");
    $(".client-error").css("max-width", width+"px");
    $("#error-text").text(error);
    $(".client-error").css("display", "block");
}


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
function generateRandomString(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}


/* ----------------------------------------------------------------------- */
/* -------------------------- Playing Songs! ----------------------------- */
/* ----------------------------------------------------------------------- */
/*
window.onSpotifyWebPlaybackSDKReady = function() {

    var player = new Spotify.Player({
        name: 'aqustic Spotify Web Player',
        getOAuthToken: function(callback) {
            //TODO the token must be put in the args for callback()
            //Also outdated token, was just temporary one for testing
            callback("your mom");
        }
    }); */

/*
 *  THE FOLLOWING CODE IS COPIED OFF OF https://beta.developer.spotify.com/documentation/web-playback-sdk/quick-start/#
 */

/*
    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });

    // Playback status updates
    player.addListener('player_state_changed', state => { console.log(state); });

    // Ready
    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player!
    player.connect();





}
*/
