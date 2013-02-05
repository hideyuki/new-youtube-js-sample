
function showVideo( sVideoId ) {
  $( "#youtube" ).html( '<iframe width="560" height="315" src="http://www.youtube.com/embed/' + sVideoId + '" frameborder="0" allowfullscreen></iframe>' );
}

// Get playlist
function getAndShowPlaylistItems( item, $thumb ) {
  var sPlaylistId = item.id.playlistId;
  var sTitle = item.snippet.title;

  $( "#playlist_title" ).html( sTitle );

  $.ajax({
    url: "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=" + sPlaylistId + "&maxResults=12&key=AIzaSyBHiu1jn_1cVHpF0xMb45yDmMmUfwyCxJA",
    dataType: "json",
    success: function( data ) {
      if ( data && data.items && data.items.length > 0 ) {
        $( "#songs" ).empty();

        _.each( data.items, function( item ) {
          console.log( item );
          var $thumb = $( '<li class="span2">' )
            .append( '<div class="thumbnail"><div class="thumbnail-image" style="background-image: url(' + item.snippet.thumbnails.default.url + ')"></div></div>' )

          var $button = $( '<a href="#myModal" role="button" class="btn" data-toggle="modal">play</a>' );
          $button.click( function() {
            $( "#myModalLabel" ).html( item.snippet.title );
            showVideo( item.snippet.resourceId.videoId );
          });
          $thumb.find( ".thumbnail" )
            .append( '<h5 class="title">' + item.snippet.title + '</h5>')
            .append( $button )
          ;
          $( "#songs" ).append( $thumb );
        });
      }
    }
  });
}

// Click topic
function clickTopic( event ) {
  var sTopicId = $( event.currentTarget ).data( "tid" );

  $.ajax({
    url: "https://www.googleapis.com/youtube/v3/search?topicId=" + sTopicId + "&part=snippet&type=playlist&maxResults=12&key=AIzaSyBHiu1jn_1cVHpF0xMb45yDmMmUfwyCxJA",
    dataType: "json",
    success: function( data ) {
      if ( data && data.items && data.items.length > 0 ) {
        $( "#playlists" ).empty();
        $( "#songs" ).empty();
        $( "#playlist_title" ).empty();

        _.each( data.items, function( item ) {
          var $thumb = $( '<li class="span2">' )
            .append( '<div class="thumbnail"><div class="thumbnail-image" style="background-image: url(' + item.snippet.thumbnails.medium.url + ')"></div></div>' )

          $thumb.find( ".thumbnail" ).append( '<h5 class="title">' + item.snippet.title + '</h5>');
          $( "#playlists" ).append( $thumb );

          $thumb.click( function() {
            getAndShowPlaylistItems( item, $thumb );
          });
        });
      }
    }
  });
}

// Search
function search( sWord ) {
  $.ajax({
    url: "https://www.googleapis.com/freebase/v1/search?query=" + sWord + "&limit=40&lang=ja",
    dataType: "json",
    success: function( data ) {
      if ( data && data.result && data.result.length > 0 ) {
        // remove all topics
        $( "#topic_result" )
          .children().each( function(){
            $( this ).off( "click" );
          } ).end()
          .empty()
        ;

        $( "#playlists" ).empty();
        $( "#songs" ).empty();
        $( "#playlist_title" ).empty();

        _.each( data.result, function( topic ) {
          if ( topic.notable ) {
            var sName = topic.name;
            var sMid = topic.mid;
            var sNotable = topic.notable.name;

            if ( sName == "" ) {
              return;
            }

            var $dev = $( '<button class="btn btn-small topic"></button>' )
              .html( sName + " (" + sNotable + ")" )
              .attr( "data-tid", sMid )
            ;

            $dev.click( clickTopic );

            $( "#topic_result" ).append( $dev );
          }
        });
      }
    }
  });
}

$(function() {
  $("#search_input")
    .typeahead({
      source: function( query, process ) {
        $.ajax({
          url: "https://suggestqueries.google.com/complete/search?client=youtube&hl=en&ds=yt&cp=3&gs_id=d&q=" + query,
          dataType: "jsonp",
          json: "jsoncallback",
          success: function( data ) {
            var arr = _.map( data[1], function( d ) {
              return d[0];
            });
            arr.unshift( query );
            process( arr );
          }
        });
      }
    })
    .on( "change", function() {
      var sWord = $("#search_input" ).val();
      search( sWord );
    })
  ;

  $( "#close" ).click( function() {
    $( "#youtube" ).empty();
  });
});