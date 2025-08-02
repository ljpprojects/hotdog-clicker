// Routes the user to the mobile or desktop website based on the screen dimensions.

(async () => {
  const heightToWidthRatio = window.innerHeight / window.innerWidth;
  const widthToHeightRatio = window.innerWidth / window.innerHeight;

  console.log(heightToWidthRatio);
  console.log(widthToHeightRatio);

  if (heightToWidthRatio < widthToHeightRatio) {
    window.location.href = "https://hdc.ljpprojects.org/desktop";
  } else {
    window.location.href = "https://hdc.ljpprojects.org/mobile";
  }
})()
