// function flip() {
//     // Get the elements by their IDs
//     var manButton = document.getElementById("man");
//     var front = document.getElementsById("front");
//     var closeButton = document.getElementById("close");

//     // Toggle visibility of the buttons
//     manButton.style.display = "none";  // Hide the 'Manual' button
//     front.style.display = "none";
//     closeButton.style.display = "block";  // Show the 'Close' button
//     };

function flip() {
  var card = document.querySelector('.container');
  card.classList.toggle('flipped');
}
