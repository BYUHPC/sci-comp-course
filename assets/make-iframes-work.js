// Adds `target="_top" to every link on the page so that the page can be used by iframes if 'linktarget=top' is in the link parameters; for use with Canvas

document.addEventListener('DOMContentLoaded', function () {
    var UrlParams = new URLSearchParams(window.location.search);
    if (UrlParams.get('linktarget') === 'top') {
        var links = document.getElementsByTagName('a');
        for(var i=0; i<links.length; i++) {
            if (!links[i].hasAttribute('target')) {
                links[i].target = '_top';
            }
        }
    }
});
