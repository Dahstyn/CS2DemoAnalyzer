const hc = document.getElementById("HC");
const hmcombobox = document.getElementById("hmcombobox");
const chartcombobox = document.getElementById("chartcombobox");
const killRadioButton = document.getElementById("kill");
const deathRadioButton = document.getElementById("death");
const chartSwitcherRadioButton = document.getElementById("chart-switcher");
let startingTeamCT = [];
let startingTeamT = [];
let radar = document.getElementById("radar");
let money = 0;
let selectedTeamOfChart = "CT";
let chselectedPlayerId = "default";
let hmselectedPlayerId = "default";
let killHeatmapInstance;
let deathHeatmapInstance;
let moneyChart = null;
let matchData = null;
let config = {
    radius: 0,
    maxOpacity: 0.8,
    minOpacity: 0.1,
    blur: 0.6,
    gradient: {
         "0.2": "#ff1900",
        "0.6": "#ffa600",
        "0.75": "#ffeebb",
    }
};
            
fetch("http://localhost:8080/api/test")
    .then(res => { if(!res.ok) throw new Error(`HTTP-Fehler: ${res.status}`);
        return res.json()})
    .then(data => {
        matchData = data;
        document.getElementById("mapData").innerHTML = `<img class="mapLogo" src="assets/mapLogos/map_icon_${data.map}.png" alt="mapLogo"> ${data.map.slice(3)}`;
        document.getElementById("score").textContent = `Score ${data.finalScore.teamStartingCT} : ${data.finalScore.teamStartingT} (${data.halftimeScore.teamStartingT} : ${data.halftimeScore.teamStartingCT})`
        data.players.forEach(player =>{
            const option = document.createElement("option");
            option.value = player.id;
            option.textContent = player.name;
            hmcombobox.add(option);

            if(player.startingteam == "CT"){
                startingTeamCT.push(player);
            }else if(player.startingteam == "T"){
                startingTeamT.push(player);
            }
        });
        
        fillComboboxByTeam(data);


        radar.onload = () => {    
            config.radius = calcRad(radar);
            updateHeatmap(); 
        };
        radar.src = `assets/radar/${data.map}.jpg`;
        showChart();
    })
    .catch(error => {
        console.error(error);
    });

function fillComboboxByTeam(data){
    if (selectedTeamOfChart === "CT" || selectedTeamOfChart === "T"){
        data.players.filter(player => player.startingteam === selectedTeamOfChart).forEach(player =>{
            const option = document.createElement("option");
            option.value = player.id;
            option.textContent = player.name;
            chartcombobox.add(option);
        });
    }else{console.error}//Fehlerbehandlung hinzufügen
}
function emptyComboboxByTeam(data){
    const playerOption = document.querySelectorAll('#chartcombobox option:not([value="default"])');
    if (typeof playerOption !== "undefined" ){
        playerOption.forEach(option => option.remove());
    }
}

function updateHeatmap(){
    if(getActiveRadioButton().value == "victim"){
                renderDeathHeatmap(matchData, radar, config);
            }else {renderKillHeatmap(matchData, radar, config);}
}

function renderKillHeatmap(data, radar, config){

    const oldCanvases = document.getElementById("HC").querySelectorAll("canvas");
    oldCanvases.forEach(canvas => canvas.remove());

    config.radius = calcRad(radar);
    const points = createKillPoints(data, radar);

    killHeatmapInstance = h337.create({
        ...config,
        container: hc,
    });

    killHeatmapInstance.setData({
        min: 0,
        max: 2.5,
        data: points
    });  
}

function renderDeathHeatmap(data, radar, config){

    const oldCanvases = document.getElementById("HC").querySelectorAll("canvas");
    oldCanvases.forEach(canvas => canvas.remove());
    
    config.radius = calcRad(radar);
    const points = createDeathPoints(data, radar);

    deathHeatmapInstance = h337.create({
        ...config,
        container: hc,
    });


    deathHeatmapInstance.setData({
        min: 0,
        max: 2.5,
        data: points
    });  
}
function calcRad(radar){
    return Math.max(5, Math.round(radar.clientWidth * 0.02));
}
function createKillPoints(data, radar){
    const scaleX = radar.clientWidth / radar.naturalWidth;
    const scaleY = radar.clientHeight / radar.naturalHeight;

    return data.kills
        .filter(kill => hmselectedPlayerId === "default" || kill.killer.id == hmselectedPlayerId)
        .map(kill => ({
            x: Math.round(kill.kposition.x * scaleX),
            y: Math.round(kill.kposition.y * scaleY),
            value: 1
        }));
}

function createDeathPoints(data, radar){
    const scaleX = radar.clientWidth / radar.naturalWidth;
    const scaleY = radar.clientHeight / radar.naturalHeight;

    return data.kills.filter(kill => hmselectedPlayerId === "default" || kill.victim.id == hmselectedPlayerId).map(kill => ({
        x: Math.round(kill.vposition.x * scaleX),
        y: Math.round(kill.vposition.y * scaleY),
        value: 1
    }));
}

function getActiveRadioButton(){
    return document.querySelector(`input[name=hm]:checked`)
}

function showChart(){
    const rounds = matchData.rounds
    const labels = rounds.map(round => round.roundNumber)
    money = rounds.map(round => {
        if (chselectedPlayerId === "default"){
            return round.playerEconomy.filter(player => {
                if(selectedTeamOfChart == "CT"){
                    return startingTeamCT.some(p => player.id == p.id);
                }else if (selectedTeamOfChart == "T"){
                    return startingTeamT.some(p => player.id == p.id);
                }
            }).reduce((acc, currentValue) => acc + currentValue.money, 0,);
    }else{
        return round.playerEconomy.find(player => String(player.id) === String(chselectedPlayerId)).money;
    }
    })
    if(moneyChart !== null){
        moneyChart.destroy();
    }
    moneyChart = new Chart(document.getElementById("chart"), {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Money at the start of every round",
                data: money
            }]

        }
    })
}


window.addEventListener("resize", () =>{
    const radar = document.getElementById("radar");
    if(radar.complete){
        radar.dispatchEvent(new Event("load"))
    }
})

killRadioButton.addEventListener('change', (event) => {
    if(event.target.checked){
        renderKillHeatmap(matchData, radar, config);
    }
})
deathRadioButton.addEventListener('change', (event) => {
    if(event.target.checked){
        renderDeathHeatmap(matchData, radar, config);
    }
})

hmcombobox.addEventListener('change', () => {
    hmselectedPlayerId = hmcombobox.value;
    updateHeatmap();
})

chartcombobox.addEventListener('change', () => {
    chselectedPlayerId = chartcombobox.value;
    showChart();
})

chartSwitcherRadioButton.addEventListener('change', (event) => {
    selectedTeamOfChart = event.target.value;
    emptyComboboxByTeam(matchData);
    fillComboboxByTeam(matchData);
    chselectedPlayerId = "default";
    showChart();
})