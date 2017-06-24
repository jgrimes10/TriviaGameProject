// JSLint developer definitions
/*jslint devel: true*/

// Global variables
var currentQuestion = 0;
var secondsPerQuestion = 15;
var correctAnswer = -1;

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
        // Hide answer boxes until the trivia game starts
        document.getElementById("answers").style.display = "none";
    }
};

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
        document.getElementById("a3").style.visibility = "visible";
        document.getElementById("a4").style.visibility = "visible";
        
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
        document.getElementById("a3").style.visibility = "hidden";
        document.getElementById("a4").style.visibility = "hidden";
        
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

// Function to check the answer the user clicked
function checkAnswer(answer) {
    "use strict";
    // Check the given answer against the correct answer
    if (answer == window.correctAnswer) {
        alert("RIGHT!");
        window.currentQuestion += 1;
        
        DisplayQuestion();
    } else {
        alert("WRONG!");
    }
}

// Function to display the questions
function DisplayQuestion() {
    "use strict";
    var questionDiv = document.getElementById("question"),
        questionObj;
    
    // If this is the first question
    if (window.currentQuestion === 0) {
        
        // Show the answers
        document.getElementById("answers").style.display = "block";
        
        // Get the JSON object from the API
        xmlhttpRequest(localStorage.getItem("fullURL"));
        
        // Get rid of the start button
        document.getElementById("startBtn").remove();
    }
    
    // Parse the results
    questionObj = JSON.parse(localStorage.getItem("questionObj"));
    
    questionDiv.innerHTML = "";
    
    // Set the question's text to the current question
    questionDiv.innerHTML = questionObj.results[window.currentQuestion].question;
    
    // Display the answers, both right and wrong
    displayAnswers(questionObj);
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