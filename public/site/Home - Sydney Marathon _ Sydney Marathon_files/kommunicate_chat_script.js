window.addEventListener("load", () => {
  (function(d, m) {
    const kommunicateSettings = {
      appId: APP_ID.input,
      automaticChatOpenOnNavigation: true,
      popupWidget: false,
    };
    let s = document.createElement("script");
    s.defer = true;
    s.type = "text/javascript";
    s.src = "https://widget.kommunicate.io/v2/kommunicate.app";
    var h = document.getElementsByTagName("head")[0];
    h.appendChild(s);
    window.kommunicate = m;
    m._globals = kommunicateSettings;
  })(document, window.kommunicate || {});
});
