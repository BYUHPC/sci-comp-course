/* Hides the header and footer so that the page can be used by iframes if 'for_iframe=true'
   is in the link parameters; it's meant for use with Canvas. If 'links_open_in_parent=true'
   is in the link parameters, adds `target="_top" to every link on the page.
*/

document.addEventListener('DOMContentLoaded', function () {
    const UrlParams = new URLSearchParams(window.location.search);
    if (UrlParams.get('for_iframe') === 'true') {
        // Add target="_top" to links
        var links = document.getElementsByTagName('a');
        if (UrlParams.get('links_open_in_parent') === 'true') {
            for(var i=0; i<links.length; i++) {
                if (!links[i].hasAttribute('target')) {
                    links[i].target = '_top';
                }
            }
        }
        // Hide header and footer
        document.body.classList.add('hide-header-and-footer')
    }
});