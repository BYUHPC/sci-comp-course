// Adds `target="_top" to every link on the page and hides the header and footer so that the page can be used by iframes
// if 'for_iframe=true' is in the link parameters; for use with Canvas.

document.addEventListener('DOMContentLoaded', function () {
    const UrlParams = new URLSearchParams(window.location.search);
    if (UrlParams.get('for_iframe') === 'true') {
        // Add target="_top" to links
        var links = document.getElementsByTagName('a');
        for(var i=0; i<links.length; i++) {
            if (!links[i].hasAttribute('target')) {
                links[i].target = '_top';
            }
        }
        // Hide header and footer
        document.body.classList.add('hide-header-and-footer')
    }
});