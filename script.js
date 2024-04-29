const listContainer = document.getElementById("list-container");
const inputBox = document.getElementById("input-box");
const startTimeInput = document.getElementById("start-time");
const endTimeInput = document.getElementById("end-time");
const taskContainer = document.getElementById("task-container");
const backdrop = document.querySelector(".backdrop");
const noTaskImage = document.getElementById("no-task-image");

function addTask() {
  if (inputBox.value === "" || startTimeInput.value === "" || endTimeInput.value === "") {
    alert("Please fill in all fields");
  } else {
    let li = document.createElement("li");
    let taskText = inputBox.value;
    let startTime = startTimeInput.value;
    let endTime = endTimeInput.value;

    li.innerHTML = `${taskText}<br><small><strong>${formatTime(startTime)} - ${formatTime(endTime)}</strong></small>`;
    listContainer.appendChild(li);
    li.classList.add("task-item");

    let span = document.createElement("span");
    span.innerHTML = "\u00d7";
    li.appendChild(span);

    // Generate light random linear gradients
    let gradient = generateLightGradient();
    li.style.background = gradient;

    // Create a timer element inside the task-item
    let timerElement = document.createElement("small");
    timerElement.classList.add("timer");
    li.appendChild(timerElement);

    // Calculate countdown time and start timer
    let countdownTime = calculateCountdown(startTime, endTime);
    startTimer(countdownTime, timerElement, startTime, li); // Pass the task item to the startTimer function

    // Hide the no-task image when a task is added
    noTaskImage.style.display = "none";
  }

  inputBox.value = "";
  startTimeInput.value = "";
  endTimeInput.value = "";
  saveTask();
}


function generateLightGradient() {
  let r1 = Math.floor(Math.random() * 155) + 100; // Adjusted range for lighter shades
  let g1 = Math.floor(Math.random() * 155) + 100;
  let b1 = Math.floor(Math.random() * 155) + 100;
  let r2 = Math.floor(Math.random() * 155) + 100; // Adjusted range for lighter shades
  let g2 = Math.floor(Math.random() * 155) + 100;
  let b2 = Math.floor(Math.random() * 155) + 100;
  return `linear-gradient(to right, rgb(${r1}, ${g1}, ${b1}), rgb(${r2}, ${g2}, ${b2}))`;
}

function formatTime(time) {
  let hours = parseInt(time.split(":")[0]);
  let meridiem = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  return `${hours}:${time.split(":")[1]}${meridiem}`;
}

function calculateCountdown(startTime, endTime) {
  let start = new Date();
  let end = new Date();
  let [startHour, startMinute] = startTime.split(":");
  let [endHour, endMinute] = endTime.split(":");
  start.setHours(startHour, startMinute, 0);
  end.setHours(endHour, endMinute, 0);
  let countdownTime = end - start; // Difference in milliseconds
  return countdownTime;
}

function getCurrentTime() {
  let currentTime = new Date();
  let hours = currentTime.getHours();
  let minutes = currentTime.getMinutes();
  let seconds = currentTime.getSeconds();
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function startTimer(duration, timerElement, startTime, taskItem) {
  let intervalId = setInterval(function () {
    // Get current time in seconds
    let currentTime = new Date();
    let currentHours = currentTime.getHours();
    let currentMinutes = currentTime.getMinutes();
    let currentSeconds = currentTime.getSeconds();

    if (currentHours === parseInt(startTime.split(":")[0]) &&
        currentMinutes === parseInt(startTime.split(":")[1]) &&
        currentSeconds === 0) {
      console.log("Timer started for task: ", getCurrentTime());
      alert("Timer started for task: " + taskItem.innerText.split("\n")[0]);
      clearInterval(intervalId); // Stop the interval if start time is reached
      let timer = duration / 1000; // Convert milliseconds to seconds
      let countdownId = setInterval(function () {
        if (timer < 0) {
          clearInterval(countdownId);
          console.log("Timer over: ", getCurrentTime());
          alert("Time over for task: " + timerElement.parentElement.innerText.split("\n")[0]);
          timerElement.innerText = "Time over"; // Show "Time over" message
          taskItem.classList.add("time-over"); // Add a class to mark the task as time over
          // Store timer state in local storage
          localStorage.setItem("timeOverTask", taskItem.id);
          return;
        }
        timerElement.innerText = formatTimeRemaining(timer);
        timer--;
        // Store remaining time in local storage
        localStorage.setItem("remainingTime", timer);
        localStorage.setItem("startTime", startTime);
      }, 1000); // Update every second
    }
  }, 1000); // Check every second for start time

  // Retrieve remaining time and start time from local storage if available
  let remainingTime = parseInt(localStorage.getItem("remainingTime"));
  let storedStartTime = localStorage.getItem("startTime");
  if (!isNaN(remainingTime) && storedStartTime === startTime) {
    startTimer(remainingTime * 1000, timerElement, startTime, taskItem); // Restart timer with remaining time
  }
}

function formatTimeRemaining(time) {
  let hours = Math.floor(time / 3600);
  let minutes = Math.floor((time % 3600) / 60);
  let seconds = time % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

listContainer.addEventListener("click", function (e) {
  if (e.target.tagName === "LI") {
    e.target.classList.toggle("checked");
    saveTask();
  } else if (e.target.tagName === "SPAN") {
    e.target.parentElement.remove();
    saveTask();
  }
});

function saveTask() {
  localStorage.setItem("data", listContainer.innerHTML);
}

function showTask() {
  listContainer.innerHTML = localStorage.getItem("data");
}

showTask();

function newTask() {
  taskContainer.style.display = "block";
  backdrop.style.display = "block";
  localStorage.setItem("taskContainerState", "open"); // Store the state in local storage
}

function closeTaskContainer() {
  taskContainer.style.display = "none";
  backdrop.style.display = "none";
  localStorage.setItem("taskContainerState", "closed"); // Store the state in local storage
}

// Check local storage for the task container state on page load
window.addEventListener("load", function () {
  const taskContainerState = localStorage.getItem("taskContainerState");
  if (taskContainerState === "open") {
    taskContainer.style.display = "block";
    backdrop.style.display = "block";
  } else {
    taskContainer.style.display = "none";
    backdrop.style.display = "none";
  }

  // Check if there's a time-over task in local storage and mark it accordingly
  const timeOverTaskId = localStorage.getItem("timeOverTask");
  if (timeOverTaskId) {
    const timeOverTask = document.getElementById(timeOverTaskId);
    if (timeOverTask) {
      timeOverTask.classList.add("time-over");
    }
  }
});

document.getElementById("add-task").addEventListener("click", newTask);
document.querySelector(".cancel-icon").addEventListener("click", closeTaskContainer);
