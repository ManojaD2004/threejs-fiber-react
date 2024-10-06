function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var j = 0; j < 6; j++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export default getRandomColor;
