let isMobileSafari = () => {
  let ua = window.navigator.userAgent;
  let iOS = !!ua.match(/ iP(ad|od|hone)/i);
  let webkit = !!ua.match(/WebKit/i);
  return iOS && webkit && !ua.match(/CriOS/i);
};

let reCalcMinHeightUpdated = 0;

let reCalcMinHeightforBody = () => {
  setTimeout(() => {
    if (reCalcMinHeightUpdated + 100 > Date.now()) {
      return;
    }

    reCalcMinHeightUpdated = Date.now();

    let vh = window.innerHeight;
    document.body.style.minHeight = vh + "px";
    document.body.parentNode.style.minHeight = vh + "px";
  }, 1);
};

if (document.body.classList.contains("min-height-100vh") && isMobileSafari()) {
  reCalcMinHeightforBody();
  window.addEventListener("orientationchange", reCalcMinHeightforBody, true);
  window.addEventListener("pageshow", reCalcMinHeightforBody, true);
  window.addEventListener("resize", reCalcMinHeightforBody, true);
} else {
  document.body.style.minHeight = "100vh";
  document.body.parentNode.style.minHeight = "100vh";
}
