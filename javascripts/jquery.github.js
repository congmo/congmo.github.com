jQuery.githubUser = function(username, callback) {
  jQuery.getJSON("http://congmo.disqus.com/recent_comments_widget.js?num_items=5&amp;hide_avatars=0&amp;avatar_size=32&amp;excerpt_length=20" + "?callback=?", callback);
}