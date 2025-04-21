// script.js

const apiKey = '';  // Your OpenWeatherMap API key
// https://openweathermap.org/
let cities = [];  // List of cities

// Mapping of weather condition codes to Weather Icons classes
const weatherIcons = {
    '01d': 'wi-day-sunny',
    '01n': 'wi-night-clear',
    '02d': 'wi-day-cloudy',
    '02n': 'wi-night-alt-cloudy',
    '03d': 'wi-cloud',
    '03n': 'wi-cloud',
    '04d': 'wi-cloudy',
    '04n': 'wi-cloudy',
    '09d': 'wi-showers',
    '09n': 'wi-showers',
    '10d': 'wi-day-rain',
    '10n': 'wi-night-alt-rain',
    '11d': 'wi-thunderstorm',
    '11n': 'wi-thunderstorm',
    '13d': 'wi-snow',
    '13n': 'wi-snow',
    '50d': 'wi-fog',
    '50n': 'wi-fog'
};

/**
 * Adds a city to the list of cities and updates the displayed city list.
 * The user can enter city, city,state, or city,state,country.
 */
function addCity() {
    const cityInput = document.getElementById('city-input').value.trim();
    if (cityInput) {
        cities.push(cityInput);  // Add the entered city to the cities array
        document.getElementById('city-input').value = '';  // Clear the input field
        updateCityList();  // Update the displayed city list
    }
}

/**
 * Updates the display of the city list based on the current cities array.
 */
function updateCityList() {
    const cityList = document.getElementById('city-list');
    cityList.innerHTML = '';  // Clear the current list
    cities.forEach((city) => {
        const cityElement = document.createElement('p');  // Create a new paragraph element
        cityElement.textContent = city;  // Set the text content to the city name
        cityList.appendChild(cityElement);  // Add the paragraph to the city list div
    });
}

/**
 * Creates weather widgets for all cities in the list and fetches their weather data.
 */
function getWeatherForCities() {
    const weatherType = document.getElementById('weather-type').value;  // Get the selected weather type
    const units = document.getElementById('units').value;  // Get the selected units
    const includeMap = document.getElementById('include-map').checked;  // Get the map inclusion option
    const weatherWidgets = document.getElementById('weather-widgets');
    weatherWidgets.innerHTML = '';  // Clear existing widgets

    cities.forEach((city, index) => {
        const widgetId = `city${index + 1}`;  // Unique ID for each widget
        const widget = document.createElement('div');  // Create a new div element for the widget
        widget.className = `weather-widget ${includeMap ? '' : 'no-map'}`;  // Set the class for styling
        widget.id = widgetId;  // Set the unique ID

        // Set the inner HTML of the widget with placeholders
        widget.innerHTML = `
            <div class="weather-info">
                <div class="weather-text">
                    <h2>${city}</h2>
                    <i class="weather-icon current-icon"></i>
                    <p class="location"></p>
                    <p class="temperature"></p>
                    <p class="description"></p>
                </div>
                ${includeMap ? `<div id="map${index + 1}" class="map"></div>` : ''}
            </div>
            ${weatherType === 'forecast' ? `
            <div class="forecast">
                <div class="day">
                    <p class="day-name">Day 1</p>
                    <i class="weather-icon forecast-icon"></i>
                    <p class="forecast-temp"></p>
                </div>
                <div class="day">
                    <p class="day-name">Day 2</p>
                    <i class="weather-icon forecast-icon"></i>
                    <p class="forecast-temp"></p>
                </div>
                <div class="day">
                    <p class="day-name">Day 3</p>
                    <i class="weather-icon forecast-icon"></i>
                    <p class="forecast-temp"></p>
                </div>
                <div class="day">
                    <p class="day-name">Day 4</p>
                    <i class="weather-icon forecast-icon"></i>
                    <p class="forecast-temp"></p>
                </div>
                <div class="day">
                    <p class="day-name">Day 5</p>
                    <i class="weather-icon forecast-icon"></i>
                    <p class="forecast-temp"></p>
                </div>
            </div>` : ''}
        `;
        weatherWidgets.appendChild(widget);  // Add the widget to the weather widgets div
        if (weatherType === 'current') {
            getCurrentWeather(city, widgetId, units, includeMap ? index + 1 : null);  // Fetch current weather data for the city
        } else if (weatherType === 'forecast') {
            getForecastWeather(city, widgetId, units, includeMap ? index + 1 : null);  // Fetch forecast weather data for the city
        }
    });
}

/**
 * Fetches and displays the current weather for a given city.
 * @param {string} city - The name of the city.
 * @param {string} widgetId - The ID of the widget element.
 * @param {string} units - The units to use (metric or imperial).
 * @param {number|null} mapId - The ID of the map element, or null if no map is to be displayed.
 */
async function getCurrentWeather(city, widgetId, units, mapId) {
    try {
        // Get geographical coordinates for the city
        const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`;
        const geoResponse = await fetch(geoApiUrl);
        if (!geoResponse.ok) {
            throw new Error(`Geolocation API error: ${geoResponse.statusText}`);
        }
        const geoData = await geoResponse.json();
        if (geoData.length === 0) {
            throw new Error(`City not found: ${city}`);
        }
        const { lat, lon } = geoData[0];  // Extract latitude and longitude

        // Get current weather data using the coordinates
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.statusText}`);
        }
        const data = await response.json();

        console.log(data);  // Log the weather data to the console for debugging

        // Select the widget element by ID
        const widget = document.getElementById(widgetId);
        // Update current weather
        widget.querySelector('.location').textContent = `${city}`;
        widget.querySelector('.temperature').textContent = `${Math.round(data.main.temp)} ${units === 'metric' ? '°C' : '°F'}`;
        widget.querySelector('.temperature').style.color = getTemperatureColor(data.main.temp, units);
        widget.querySelector('.description').textContent = data.weather[0].description;

        // Update current weather icon
        const currentIconCode = data.weather[0].icon;
        const currentIconClass = weatherIcons[currentIconCode];
        widget.querySelector('.current-icon').className = `weather-icon wi ${currentIconClass}`;

        // Display weather map if mapId is provided
        if (mapId !== null) {
            displayWeatherMap(lat, lon, mapId);
        }
    } catch (error) {
        console.error(`Failed to fetch current weather data for ${city}:`, error);
        alert(`Failed to fetch current weather data for ${city}. Error: ${error.message}`);
    }
}

/**
 * Fetches and displays the weather forecast for a given city.
 * @param {string} city - The name of the city.
 * @param {string} widgetId - The ID of the widget element.
 * @param {string} units - The units to use (metric or imperial).
 * @param {number|null} mapId - The ID of the map element, or null if no map is to be displayed.
 */
async function getForecastWeather(city, widgetId, units, mapId) {
    try {
        // Get geographical coordinates for the city
        const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`;
        const geoResponse = await fetch(geoApiUrl);
        if (!geoResponse.ok) {
            throw new Error(`Geolocation API error: ${geoResponse.statusText}`);
        }
        const geoData = await geoResponse.json();
        if (geoData.length === 0) {
            throw new Error(`City not found: ${city}`);
        }
        const { lat, lon } = geoData[0];  // Extract latitude and longitude

        // 5 Day / 3 Hour Forecast API call
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.statusText}`);
        }
        const data = await response.json();

        // Update the widget with the current weather and forecast data
        const widget = document.getElementById(widgetId);
        const forecastList = data.list;

        widget.querySelector('.location').textContent = `${city}`;
        widget.querySelector('.temperature').textContent = `${Math.round(forecastList[0].main.temp)} ${units === 'metric' ? '°C' : '°F'}`;
        widget.querySelector('.temperature').style.color = getTemperatureColor(forecastList[0].main.temp, units);
        widget.querySelector('.description').textContent = forecastList[0].weather[0].description;

        // Update current weather icon
        const currentIconCode = forecastList[0].weather[0].icon;
        const currentIconClass = weatherIcons[currentIconCode];
        widget.querySelector('.current-icon').className = `weather-icon wi ${currentIconClass}`;

        // Display forecast section
        widget.querySelector('.forecast').style.display = 'flex';

        // Map to store highest temperatures for each day
        const dailyMaxTemps = {};

        // Loop through forecastList to fill dailyMaxTemps
        forecastList.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString('en-US', { weekday: 'long' });
            const temp = item.main.temp;

            // Store the highest temperature for each day
            if (!dailyMaxTemps[day] || dailyMaxTemps[day].temp < temp) {
                dailyMaxTemps[day] = {
                    temp: temp,
                    icon: item.weather[0].icon,
                    date: date
                };
            }
        });

        // Get unique days in order
        const days = Object.keys(dailyMaxTemps).slice(1, 6);

        // Update 5-day forecast
        days.forEach((day, i) => {
            const dayElement = widget.querySelectorAll('.day')[i];
            dayElement.querySelector('.day-name').textContent = dailyMaxTemps[day].date.toLocaleDateString('en-US', { weekday: 'long' });
            const forecastIconClass = weatherIcons[dailyMaxTemps[day].icon];
            dayElement.querySelector('.forecast-icon').className = `weather-icon wi ${forecastIconClass}`;
            dayElement.querySelector('.forecast-temp').textContent = `${Math.round(dailyMaxTemps[day].temp)} ${units === 'metric' ? '°C' : '°F'}`;
            dayElement.querySelector('.forecast-temp').style.color = getTemperatureColor(dailyMaxTemps[day].temp, units);
        });

        // Display weather map if mapId is provided
        if (mapId !== null) {
            displayWeatherMap(lat, lon, mapId);
        }
    } catch (error) {
        console.error(`Failed to fetch forecast weather data for ${city}:`, error);
        alert(`Failed to fetch forecast weather data for ${city}. Error: ${error.message}`);
    }
}

/**
 * Displays the weather map for a given location.
 * @param {number} lat - The latitude of the location.
 * @param {number} lon - The longitude of the location.
 * @param {number} mapId - The ID of the map element.
 */
function displayWeatherMap(lat, lon, mapId) {
    const map = L.map(`map${mapId}`).setView([lat, lon], 10);

    // OpenStreetMap tile layer
    // https://www.openstreetmap.org/about
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // OpenWeatherMap Precipitation layer with increased opacity
    // https://openweathermap.org/api/weathermaps
    L.tileLayer(`https://tile.openweathermap.org/map/precipitation_cls/{z}/{x}/{y}.png?appid=${apiKey}`, {
        attribution: 'Map data © <a href="https://openweathermap.org/">OpenWeatherMap</a>',
        maxZoom: 19,
        opacity: 0.7
    }).addTo(map);
}

/**
 * Returns a color based on the temperature value.
 * @param {number} temp - The temperature value.
 * @param {string} units - The units (metric or imperial).
 * @returns {string} - The color representing the temperature.
 */
function getTemperatureColor(temp, units) {
    if (units === 'metric') {
        if (temp >= 30) {
            return '#ff5722';  // Hot
        } else if (temp >= 20) {
            return '#ff9800';  // Warm
        } else if (temp >= 10) {
            return '#2196f3';  // Cool
        } else {
            return '#03a9f4';  // Cold
        }
    } else {
        if (temp >= 86) {
            return '#ff5722';  // Hot
        } else if (temp >= 68) {
            return '#ff9800';  // Warm
        } else if (temp >= 50) {
            return '#2196f3';  // Cool
        } else {
            return '#03a9f4';  // Cold
        }
    }
}
