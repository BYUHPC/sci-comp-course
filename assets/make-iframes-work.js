/* Hides the header and footer and adds `target="_top"` to every link on the page so that it
   can be used by iframes if 'for_iframe=true' is in the link parameters; it's meant for use
   with Canvas. If 'links_open_new_tab=true' is in the link parameters, adds
   `target="_blank"` to every link on the page instead.
*/

document.addEventListener('DOMContentLoaded', function () {
    const UrlParams = new URLSearchParams(window.location.search);
    if (UrlParams.get('for_iframe') === 'true') {
        // Add target="_top" to links
        var links = document.getElementsByTagName('a');
        for(var i=0; i<links.length; i++) {
            if (!links[i].hasAttribute('target')) {
                if (UrlParams.get('links_open_new_tab') === 'true') {
                    links[i].target = '_blank';
                } else {
                    links[i].target = '_top';
                }
            }
        }
        // Hide header and footer
        document.body.classList.add('hide-header-and-footer')
    }
});