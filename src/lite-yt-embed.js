/**
 * A lightweight youtube embed. Still should feel the same to the user, just MUCH faster to initialize and paint.
 *
 * Thx to these as the inspiration
 *   https://storage.googleapis.com/amp-vs-non-amp/youtube-lazy.html
 *   https://autoplay-youtube-player.glitch.me/
 *
 * Once built it, I also found these:
 *   https://github.com/ampproject/amphtml/blob/master/extensions/amp-youtube (👍👍)
 *   https://github.com/Daugilas/lazyYT
 *   https://github.com/vb/lazyframe
 */
class LiteYTEmbed extends HTMLElement {
    connectedCallback() {
        this.videoId = this.getAttribute('videoid');

        let playBtnEl = this.querySelector('.lty-playbtn');
        // A label for the button takes priority over a [playlabel] attribute on the custom-element
        this.playLabel = (playBtnEl && playBtnEl.textContent.trim()) || this.getAttribute('playlabel') || 'Play';

        /**
         * Lo, the youtube placeholder image!  (aka the thumbnail, poster image, etc)
         *
         * See https://github.com/paulirish/lite-youtube-embed/blob/master/youtube-thumbnail-urls.md
         *
         * TODO: Do the sddefault->hqdefault fallback
         *       - When doing this, apply referrerpolicy (https://github.com/ampproject/amphtml/pull/3940)
         * TODO: Consider using webp if supported, falling back to jpg
         */
        if (!this.style.backgroundImage) {
          this.posterUrl = `https://i.ytimg.com/vi/${this.videoId}/hqdefault.jpg`;
          // Warm the connection for the poster image
          LiteYTEmbed.addPrefetch('preload', this.posterUrl, 'image');

          this.style.backgroundImage = `url("${this.posterUrl}")`;
        }

        // Set up play button, and its visually hidden label
        if (!playBtnEl) {
            playBtnEl = document.createElement('button');
            playBtnEl.type = 'button';
            playBtnEl.classList.add('lty-playbtn');
            this.append(playBtnEl);
        }
        if (!playBtnEl.textContent) {
            const playBtnLabelEl = document.createElement('span');
            playBtnLabelEl.className = 'lyt-visually-hidden';
            playBtnLabelEl.textContent = this.playLabel;
            playBtnEl.append(playBtnLabelEl);
        }

        // On hover (or tap), warm up the TCP connections we're (likely) about to use.
        this.addEventListener('pointerover', LiteYTEmbed.warmConnections, {once: true});

        // Once the user clicks, add the real iframe and drop our play button
        // TODO: In the future we could be like amp-youtube and silently swap in the iframe during idle time
        //   We'd want to only do this for in-viewport or near-viewport ones: https://github.com/ampproject/amphtml/pull/5003
        this.addEventListener('click', e => {
          this.addIframe();

          /* CUSTOMIZATION TO STOP VIDEO PLAY ON MOUSEOUT FOLLOWED BY A CLICK ON ANOTHER BUTTON */
          onYouTubeIframeAPIReady(); // See function definition at bottom of page

        });
    }

    // // TODO: Support the the user changing the [videoid] attribute
    // attributeChangedCallback() {
    // }

    /**
     * Add a <link rel={preload | preconnect} ...> to the head
     */
    static addPrefetch(kind, url, as) {
        const linkEl = document.createElement('link');
        linkEl.rel = kind;
        linkEl.href = url;
        if (as) {
            linkEl.as = as;
        }
        document.head.append(linkEl);
    }

    /**
     * Begin pre-connecting to warm up the iframe load
     * Since the embed's network requests load within its iframe,
     *   preload/prefetch'ing them outside the iframe will only cause double-downloads.
     * So, the best we can do is warm up a few connections to origins that are in the critical path.
     *
     * Maybe `<link rel=preload as=document>` would work, but it's unsupported: http://crbug.com/593267
     * But TBH, I don't think it'll happen soon with Site Isolation and split caches adding serious complexity.
     */
    static warmConnections() {
        if (LiteYTEmbed.preconnected) return;

        // The iframe document and most of its subresources come right off youtube.com
        LiteYTEmbed.addPrefetch('preconnect', 'https://www.youtube-nocookie.com');
        // The botguard script is fetched off from google.com
        LiteYTEmbed.addPrefetch('preconnect', 'https://www.google.com');

        // Not certain if these ad related domains are in the critical path. Could verify with domain-specific throttling.
        LiteYTEmbed.addPrefetch('preconnect', 'https://googleads.g.doubleclick.net');
        LiteYTEmbed.addPrefetch('preconnect', 'https://static.doubleclick.net');

        LiteYTEmbed.preconnected = true;
    }

    addIframe() {
        const params = new URLSearchParams(this.getAttribute('params') || []);
        params.append('autoplay', '1');

        const iframeEl = document.createElement('iframe');
        iframeEl.width = 560;
        iframeEl.height = 315;
        // No encoding necessary as [title] is safe. https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#:~:text=Safe%20HTML%20Attributes%20include
        iframeEl.title = this.playLabel;
        iframeEl.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
        iframeEl.allowFullscreen = true;
        // AFAIK, the encoding here isn't necessary for XSS, but we'll do it only because this is a URL
        // https://stackoverflow.com/q/64959723/89484
        iframeEl.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(this.videoId)}?${params.toString()}`;
        this.append(iframeEl);

        this.classList.add('lyt-activated');

        // Set focus for a11y
        this.querySelector('iframe').focus();

    }
}
// Register custom element
customElements.define('lite-youtube', LiteYTEmbed);

/* CUSTOMIZATION TO STOP VIDEO PLAY ON MOUSEOUT FOLLOWED BY A CLICK ON ANOTHER BUTTON */
function onYouTubeIframeAPIReady() {

    // define all buttons on page
    var slidebuttons = document.getElementsByClassName('vco-slidenav-icon');
    var otherbuttons = document.querySelectorAll("[class*=button]");
    var searchtips = document.querySelectorAll("[class*=search-tip]");

    // define the iframes
    var videos = document.getElementsByTagName('iframe');

    for (var i = 0; i < videos.length; i++) { // for each iframe
      videos[i].onmouseout = function(e) { // assign a callback for mouseout from iframe

        // define the current iframe
        var currentHoveredElement = e.target;
        // define the source youtube url
        var currentSrc = currentHoveredElement.attributes.src.value;

        // iterate through all buttons on the page
        // and listen for any click
        for (var i = 0 ; i < otherbuttons.length; i++) {
           otherbuttons[i].addEventListener('click' , method1 ) ;
        }
        for (var i = 0 ; i < slidebuttons.length; i++) {
           slidebuttons[i].addEventListener('click' , method1 ) ;
        }
        for (var i = 0 ; i < searchtips.length; i++) {
           searchtips[i].addEventListener('click' , method1 ) ;
        }
        // perform this function on click
        function method1(){
          // replace the part of the url that makes the video play automatically
          var leg = currentSrc.replace('autoplay=1','autoplay=false');
          $(e.target).attr("src",leg);
        }

      };
    }

}
