// JSLint developer definitions
/*jslint devel: true*/

// Global variables
var currentQuestion = 0;
var secondsPerQuestion = 15;
var correctAnswer = -1;
var isPlaying = false;
var action;
var score;
var timeRemaining;

// Onload checks if it is the game html and finds the span for seconds and changes it to the corrent number for the starting text to let the user know how long they will have for the amount of questions they picked
window.onload = function () {
    "use strict";
    // Variables for the path name and removing the beginning to just get the html file name
    var path = window.location.pathname,
        page = path.split("/").pop();
    
    // Checking if it is the game.html file
    if (page === "game.html") {
        // Find the "secs" span and set it to the saved number
        document.getElementById("secs").innerHTML = localStorage.getItem("secs");
    }
};

// Function to quickly hide an element
function hide(Id) {
    "use strict";
    document.getElementById(Id).style.visibility = "hidden";
}

// Function to quickly show an element
function show(Id) {
    "use strict";
    document.getElementById(Id).style.visibility = "visible";
}

// Function to stop the counter
function stopCountdown() {
    "use strict";
    
    clearInterval(action);
}

// Function to start the countdown
function startCountdown() {
    "use strict";
    
    // Start the countdown and subtract 1 from timeRemaining every 1000ms (1 sec)
    action = setInterval(function () {timeRemaining -= 1;
        document.getElementById("timeRemainingValue").innerHTML = window.timeRemaining;
        // If there is no more time remaining
        if (window.timeRemaining === 0 || currentQuestion >= localStorage.getItem("numQues")) {
            // Stop the countdown
            stopCountdown();
            
            // Make the GameOver screen visible
            show("gameOver");
            // Write the gameOver text
            document.getElementById("gameOver").innerHTML = "<p>Game Over!</p><p>Your score is " + score + ".</p>";
            
            // Hide the time remaining tex
            hide("timeRemaining");
            
            // Hide correct & incorrect box & answer boxes
            hide("a1");
            hide("a2");
            hide("a3");
            hide("a4");
            
            // Set to not playing
            window.isPlaying = false;
            
            // Change Reset button to say Start
            document.getElementById("startReset").innerHTML = "Start Game";
            
            window.currentQuestion = 0;
            
        } }, 1000); // Change the countdown every 1000ms (1 sec)
}

// Function to handle the xmlhttp request
function xmlhttpRequest(apiURL) {
    "use strict";
    var xhttp = new XMLHttpRequest(),
        myObj = "";
    
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            myObj = JSON.parse(this.responseText);
            // Store the JSON object in a string in the local storage so it can be recalled when needed
            localStorage.setItem("questionObj", JSON.stringify(myObj));
        }
    };
    xhttp.open("GET", apiURL, true);
    xhttp.send();
}

// Function to show the answers (both right and wrong)
function displayAnswers(questionObj) {
    "use strict";
    // Creating needed variables
    var answerDiv = document.getElementById("answers"),
        correctPosition = 0,
        i,
        incorrectIndex = 0;
    
    // THE QUESTION IS MULTIPLE CHOICE
    if (questionObj.results[window.currentQuestion].type === "multiple") {
        // Make sure all 4 boxes are shown
        show("a3");
        show("a4");
        
        // Generate random number to know which box to put the correct answer in
        correctPosition = Math.floor(Math.random() * 4) + 1;
        // Set the correct answer
        window.correctAnswer = correctPosition;
        
        // Find the corresponding answer box and put the answer in it
        document.getElementById("a" + correctPosition).innerHTML = questionObj.results[window.currentQuestion].correct_answer;
        
        // Go through the remaining boxes and fill in incorrect answers
        for (i = 1; i < 5; i += 1) {
            // If you're on the current box, continue to the next box and don't do anything to it
            if (i === correctPosition) {
                continue;
            }
            // Get the next answer box and put a wrong answer in it
            document.getElementById("a" + i).innerHTML = questionObj.results[window.currentQuestion].incorrect_answers[incorrectIndex];
            
            // Move to the next incorrect answer in the array
            incorrectIndex += 1;
        }
    } else {
        // THE QUESTION IS TRUE/FALSE
        
        // Hide the bottom two answers
        hide("a3");
        hide("a4");
        
        // Set the text of the true and false boxes
        document.getElementById("a1").innerHTML = "True";
        document.getElementById("a2").innerHTML = "False";
        
        // Set the correct answer
        if (questionObj.results[window.currentQuestion].correct_answer === "True") {
            window.correctAnswer = 1;
        } else {
            window.correctAnswer = 2;
        }
    }
}

// Function to display the questions
function displayQuestion() {
    "use strict";
    var questionDiv = document.getElementById("question"),
        questionObj;
    
    // If this is the first question
    if (window.currentQuestion === 0) {
        
        // Get the JSON object from the API
        xmlhttpRequest(localStorage.getItem("fullURL"));
    }
    
    // Parse the results
    questionObj = JSON.parse(localStorage.getItem("questionObj"));
    
    questionDiv.innerHTML = "";
    
    // Set the question's text to the current question
    questionDiv.innerHTML = questionObj.results[window.currentQuestion].question;
    
    // Display the answers, both right and wrong
    displayAnswers(questionObj);
}

// If we click the start/reset button
function startReset() {
    "use strict";
    
    // Show the answer boxes
    //document.getElementById("answers").style.display = "block";
    show("a1");
    show("a2");
    show("a3");
    show("a4");
    
    // If we are already playing
    if (isPlaying === true) {
        // Reload the quiz
        window.location.href = "index.html";
    } else { // If we are not playing
        
        // Change isPlaying to true
        window.isPlaying = true;
        
        // Set score to 0
        window.score = 0;
        
        // Show countdown
        show("timeRemaining");
        // Set the amount of time remaining
        window.timeRemaining = localStorage.getItem("secs");
        
        // Hide the gameover Screen
        hide("gameOver");
        
        // Change button text to Reset
        document.getElementById("startReset").innerHTML = "Reset Game";
        
        // Start the countdown
        startCountdown();
        
        // Display the question
        displayQuestion();
    }
}

// Function to check the answer the user clicked
function checkAnswer(answer) {
    "use strict";
    // Check the given answer against the correct answer
    if (answer == window.correctAnswer) {
        // Add to the score
        score += 2;
        
        // Update score on screen
        document.getElementById("scoreValue").innerHTML = window.score;
        
        // Move to the next question
        window.currentQuestion += 1;
        
        // Hide wrong box and show correct box
        hide("wrong");
        show("correct");
        // Hide correct again after 1 sec
        setTimeout(function() {
            hide("correct");
        }, 1000);
        
        // Display the next question
        displayQuestion();
    } else {
        // Subtract from score
        score -= 1;
        
        // Update score on screen
        document.getElementById("scoreValue").innerHTML = window.score;
        
        // Hide correct box and show wrong box
        hide("correct");
        show("wrong");
        // Hide wrong box again after 1 sec
        setTimeout(function () {
            hide("wrong");
        }, 1000);
    }
}

function createURL() {
    "use strict";
    
    // Checking to make sure that the user enters at least 1 question. Shows an alert if the amount of questions is less than or equal to 0
    if (document.getElementById("numQuesInput").value <= 0) {
        alert("You must enter a value greater than 0 for the number of questions. Please try again.");
        location.reload();
        return;
    }
    
    // Construct the API URL based on the selected options & creating needed variables
    var baseURL = "https://opentdb.com/api.php?",
        numQuestions = "amount=" + document.getElementById("numQuesInput").value,
        baseCategory = "&category=",
        category = document.getElementById("categoryDropDown").value,
        baseDifficulty = "&difficulty=",
        difficulty = document.getElementById("difficultyDropDown").value,
        baseType = "&type=",
        type = document.getElementById("typeDropDown").value,
        fullURL = "",
        seconds = 0;
    
    // Save the number of questions
    localStorage.setItem("numQues", document.getElementById("numQuesInput").value);
    
    // Check to see if an option was selected for category, if not, remove the base part
    if (category === "") {
        baseCategory = "";
    }
    
    // Check to see if an option was selected for difficulty, if not, remove the base part
    if (difficulty === "") {
        baseDifficulty = "";
    }
    
    // Check to see if an option was selected for type, if not, remove the base part
    if (type === "") {
        baseType = "";
    }
    
    fullURL = baseURL + numQuestions + baseCategory + category + baseDifficulty + difficulty + baseType + type;
    
    localStorage.setItem("fullURL", fullURL);
    seconds = window.secondsPerQuestion * document.getElementById("numQuesInput").value;
    localStorage.setItem("secs", seconds);

    window.location.href = "game.html";
}