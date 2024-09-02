const wrapper = document.querySelector(".wrapper"),
    inputPart = document.querySelector(".input-part"),
    infoTxt = inputPart.querySelector(".info-txt"),
    inputField = inputPart.querySelector("input"),
    locationBtn = inputPart.querySelector("button"),
    weatherPart = wrapper.querySelector(".weather-part"),
    wIcon = weatherPart.querySelector("img"),
    arrowBack = wrapper.querySelector("header i"),
    unitToggle = document.getElementById("unit-toggle"),
    historyContainer = document.querySelector(".history");

let api;
let isCelsius = true;
let searchHistory = [];

// Event listeners
inputField.addEventListener("keyup", e => {
    if (e.key == "Enter" && inputField.value != "") {
        requestApi(inputField.value);
    }
});

locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    } else {
        alert("Your browser does not support geolocation API");
    }
});

unitToggle.addEventListener("click", () => {
    isCelsius = !isCelsius;
    const unitText = isCelsius ? "Celsius" : "Fahrenheit";
    unitToggle.innerText = `Switch to ${isCelsius ? "Fahrenheit" : "Celsius"}`;
    updateWeatherUnits();
});

// Functions
function requestApi(city) {
    const unit = isCelsius ? "metric" : "imperial";
    api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=e48acd7ef8a96d5a73374cf7c8531617`;
    fetchData();
}

function onSuccess(position) {
    const { latitude, longitude } = position.coords;
    api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${isCelsius ? "metric" : "imperial"}&appid=e48acd7ef8a96d5a73374cf7c8531617`;
    fetchData();
}

function onError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            infoTxt.innerText = "Location access denied. Please allow location access.";
            break;
        case error.POSITION_UNAVAILABLE:
            infoTxt.innerText = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            infoTxt.innerText = "The request to get your location timed out.";
            break;
        case error.UNKNOWN_ERROR:
            infoTxt.innerText = "An unknown error occurred.";
            break;
    }
    infoTxt.classList.add("error");
}

function fetchData() {
    infoTxt.innerText = "Getting weather details...";
    infoTxt.classList.add("pending");
    document.querySelector(".spinner").style.display = "block"; // Show spinner

    fetch(api).then(res => res.json()).then(result => {
        document.querySelector(".spinner").style.display = "none"; // Hide spinner
        weatherDetails(result);
    }).catch(() => {
        document.querySelector(".spinner").style.display = "none"; // Hide spinner
        infoTxt.innerText = "Something went wrong";
        infoTxt.classList.replace("pending", "error");
    });
}

function weatherDetails(info) {
    if (info.cod == "404") {
        infoTxt.classList.replace("pending", "error");
        infoTxt.innerText = `${inputField.value} isn't a valid city name`;
    } else {
        const city = info.name;
        const country = info.sys.country;
        const { description, id } = info.weather[0];
        const { temp, feels_like, humidity } = info.main;
        const windSpeed = info.wind.speed;
        const pressure = info.main.pressure;

        // Update weather icon based on weather ID
        if (id == 800) {
            wIcon.src = "icons/clear.svg";
        } else if (id >= 200 && id <= 232) {
            wIcon.src = "icons/storm.svg";
        } else if (id >= 600 && id <= 622) {
            wIcon.src = "icons/snow.svg";
        } else if (id >= 701 && id <= 781) {
            wIcon.src = "icons/haze.svg";
        } else if (id >= 801 && id <= 804) {
            wIcon.src = "icons/cloud.svg";
        } else if ((id >= 500 && id <= 531) || (id >= 300 && id <= 321)) {
            wIcon.src = "icons/rain.svg";
        }

        // Update weather information in the UI
        weatherPart.querySelector(".temp .numb").innerText = Math.floor(temp);
        weatherPart.querySelector(".weather").innerText = description;
        weatherPart.querySelector(".location span").innerText = `${city}, ${country}`;
        weatherPart.querySelector(".temp .numb-2").innerText = Math.floor(feels_like);
        weatherPart.querySelector(".humidity span").innerText = `${humidity}%`;
        weatherPart.querySelector(".wind-speed span").innerText = `${windSpeed} m/s`;
        weatherPart.querySelector(".pressure span").innerText = `${pressure} hPa`;

        infoTxt.classList.remove("pending", "error");
        infoTxt.innerText = "";
        inputField.value = "";
        wrapper.classList.add("active");

        // Update search history
        updateSearchHistory(city);
    }
}

function updateSearchHistory(city) {
    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        if (searchHistory.length > 5) {
            searchHistory.shift(); // Remove the oldest entry
        }
    }
    displaySearchHistory();
}

function displaySearchHistory() {
    historyContainer.innerHTML = ""; // Clear previous history
    searchHistory.forEach(city => {
        const historyItem = document.createElement("div");
        historyItem.innerText = city;
        historyItem.addEventListener("click", () => {
            requestApi(city); // Fetch weather data for clicked history item
        });
        historyContainer.appendChild(historyItem);
    });
}

function updateWeatherUnits() {
    const unitSymbol = isCelsius ? "C" : "F";
    document.querySelectorAll(".unit").forEach(unit => {
        unit.innerText = unitSymbol;
    });
}

// Back button functionality
arrowBack.addEventListener("click", () => {
    wrapper.classList.remove("active");
});