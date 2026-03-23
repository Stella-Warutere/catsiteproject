function fixPath(path) {
  return encodeURI(path);
}

document.querySelectorAll("img").forEach(img => {
  img.src = fixPath(img.getAttribute("src"));
});

document.querySelectorAll("audio source").forEach(source => {
  source.src = fixPath(source.getAttribute("src"));
});

document.querySelectorAll("video source").forEach(source => {
  source.src = fixPath(source.getAttribute("src"));
});