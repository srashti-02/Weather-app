

const API_KEY = "e57c08069049fef27139e94500c7137b";

let tempChart = null;

/* =========================
   GET WEATHER
========================= */

async function getWeather(cityName){

let city = cityName || document.getElementById("cityInput").value.trim();

if(city==="") return;

document.getElementById("error").innerText="";

saveHistory(city);

const weatherURL =
`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

const forecastURL =
`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

try{

/* CURRENT WEATHER */

const weatherRes = await fetch(weatherURL);
const weatherData = await weatherRes.json();

if(weatherData.cod != 200){

document.getElementById("error").innerText="City not found";
return;

}

document.getElementById("city").innerText =
weatherData.name + ", " + weatherData.sys.country;

document.getElementById("temp").innerText =
Math.round(weatherData.main.temp) + "°C";

document.getElementById("desc").innerText =
weatherData.weather[0].description;

document.getElementById("humidity").innerText =
weatherData.main.humidity + "%";

document.getElementById("wind").innerText =
weatherData.wind.speed + " km/h";

document.getElementById("weatherIcon").src =
`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;

document.getElementById("feels").innerText =
Math.round(weatherData.main.feels_like) + "°C";

document.getElementById("pressure").innerText =
weatherData.main.pressure + " hPa";

document.getElementById("visibility").innerText =
(weatherData.visibility/1000) + " km";

/* SUNRISE SUNSET */

const sunrise = new Date(weatherData.sys.sunrise*1000);
const sunset = new Date(weatherData.sys.sunset*1000);

document.getElementById("sunrise").innerText =
sunrise.toLocaleTimeString();

document.getElementById("sunset").innerText =
sunset.toLocaleTimeString();

/* RAIN EFFECT */

const weatherMain = weatherData.weather[0].main;

const rain = document.querySelector(".rain");

if(rain){

if(weatherMain === "Rain"){

rain.style.display="block";

}else{

rain.style.display="none";

}

}

/* NIGHT MODE */

const icon = weatherData.weather[0].icon;

if(icon.includes("n")){

document.body.style.filter="brightness(0.8)";

}else{

document.body.style.filter="brightness(1)";

}

/* =========================
   FORECAST
========================= */

const forecastRes = await fetch(forecastURL);

if(!forecastRes.ok){

document.getElementById("error").innerText="Forecast unavailable";
return;

}

const forecastData = await forecastRes.json();

const forecastDiv = document.getElementById("forecast");

forecastDiv.innerHTML="";

let temps=[];
let labels=[];

for(let i=0;i<forecastData.list.length;i+=8){

const item = forecastData.list[i];

const date = new Date(item.dt_txt);

temps.push(item.main.temp);

labels.push(date.toDateString().slice(0,3));

const card = document.createElement("div");

card.className="forecast-card";

card.innerHTML = `
<p>${labels[labels.length-1]}</p>
<img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png">
<p>${Math.round(item.main.temp)}°C</p>
`;

forecastDiv.appendChild(card);

}

/* =========================
   TEMPERATURE CHART
========================= */

const ctx=document.getElementById("tempChart").getContext("2d");

if(tempChart){

tempChart.destroy();

}

tempChart = new Chart(ctx,{

type:"line",

data:{

labels:labels,

datasets:[{

label:"Temperature °C",

data:temps,

borderWidth:3,

tension:0.3,

fill:false

}]

},

options:{

responsive:true,

maintainAspectRatio:false,

plugins:{

legend:{

labels:{color:"#fff"}

}

},

scales:{

x:{

ticks:{color:"#fff"}

},

y:{

ticks:{color:"#fff"}

}

}

}

});

}catch(err){

document.getElementById("error").innerText="Failed to fetch weather";

}

}

/* =========================
   VOICE SEARCH
========================= */

function voiceSearch(){

const recognition = new webkitSpeechRecognition();

recognition.onresult = function(e){

const city = e.results[0][0].transcript;

document.getElementById("cityInput").value = city;

getWeather(city);

};

recognition.start();

}

/* =========================
   LOCATION WEATHER
========================= */

function getLocationWeather(){

navigator.geolocation.getCurrentPosition(async pos=>{

const lat = pos.coords.latitude;
const lon = pos.coords.longitude;

const url =
`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

const res = await fetch(url);

const data = await res.json();

getWeather(data.name);

});

}

/* =========================
   SEARCH HISTORY
========================= */

function saveHistory(city){

city = city.toLowerCase();

city = city.charAt(0).toUpperCase()+city.slice(1);

let history =
JSON.parse(sessionStorage.getItem("weatherHistory")) || [];

if(!history.includes(city)){

history.unshift(city);

if(history.length>6) history.pop();

sessionStorage.setItem(
"weatherHistory",
JSON.stringify(history)
);

}

renderHistory();

}

function renderHistory(){

const history =
JSON.parse(sessionStorage.getItem("weatherHistory")) || [];

const div = document.getElementById("history");

div.innerHTML="";

history.forEach(city=>{

const btn = document.createElement("button");

btn.innerText = city;

btn.onclick = ()=>getWeather(city);

div.appendChild(btn);

});

/* CLEAR HISTORY BUTTON */

if(history.length>0){

const clearBtn = document.createElement("button");

clearBtn.innerText="Clear";

clearBtn.className="clear-history";

clearBtn.onclick = clearHistory;

div.appendChild(clearBtn);

}

}

/* =========================
   CLEAR HISTORY
========================= */

function clearHistory(){

sessionStorage.removeItem("weatherHistory");

renderHistory();

}

/* =========================
   ENTER KEY SEARCH
========================= */

document.getElementById("cityInput")
.addEventListener("keypress",e=>{

if(e.key==="Enter"){

getWeather();

}

});

/* LOAD HISTORY */

renderHistory();
