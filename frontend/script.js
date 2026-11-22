const hc = document.getElementById("HC");
const hmcombobox = document.getElementById("hmcombobox");
const chartcombobox = document.getElementById("chartcombobox");
const killRadioButton = document.getElementById("kill");
const deathRadioButton = document.getElementById("death");
const chartSwitcherRadioButton = document.getElementById("chart-switcher");
const killfeed = document.getElementById("killfeed");
let radar = document.getElementById("radar");
let selectedTeamOfChart = "CT";
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

function displayMatch (data){
    hmcombobox.querySelectorAll('option:not([value="default"])').forEach(option => option.remove());
    emptyComboboxByTeam();
    hmcombobox.value = "default";
    chartcombobox.value = "default";
    killfeed.replaceChildren(killfeed.querySelector("h3"));

    const startingTeamCT = [];
    const startingTeamT = [];
    matchData = data;
  
    const background = document.getElementById("bgimg");
    const mapData = document.getElementById("map-data");
    const mapLogo = document.createElement("img");
    mapLogo.className = ("mapLogo");
    background.src = (`assets/background/bg_${data.map}.png`)
    mapLogo.src = (`assets/mapLogos/map_icon_${data.map}.png`);
    mapLogo.alt = ("Map Logo");
    mapData.replaceChildren(mapLogo, `${data.map.slice(3)}`);
    
    document.getElementById("score").textContent = `Score ${data.finalScore.teamStartingCT} : ${data.finalScore.teamStartingT} (${data.halftimeScore.teamStartingT} : ${data.halftimeScore.teamStartingCT})`
    data.players.forEach(player =>{
        const option = document.createElement("option");
        option.value = player.id;
        option.textContent = player.name.slice(0,10);
        hmcombobox.add(option);

        if(player.startingteam === "CT"){
            startingTeamCT.push(player);
        }else if(player.startingteam === "T"){
            startingTeamT.push(player);
        }
    });
    fillComboboxByTeam(data);

    radar.onload = () => {    
        config.radius = calcRad(radar);
        updateHeatmap(); 
    };
    radar.src = `assets/radar/${data.map}.jpg`;

    renderKillfeed(data, startingTeamCT, startingTeamT);

    showChart(data, selectedTeamOfChart);
    displayStats(data);
}
function fillComboboxByTeam(data){
    if (selectedTeamOfChart === "CT" || selectedTeamOfChart === "T"){
        data.players.filter(player => player.startingteam === selectedTeamOfChart).forEach(player =>{
            const option = document.createElement("option");
            option.value = player.id;
            option.textContent = player.name.slice(0,10);
            chartcombobox.add(option);
        });
    }else{console.error}
}
function emptyComboboxByTeam(){
    const playerOption = document.querySelectorAll('#chartcombobox option:not([value="default"])');
    if (typeof playerOption !== "undefined" ){
        playerOption.forEach(option => option.remove());
    }
}

function updateHeatmap(){
    if(!matchData || radar.naturalHeight === 0 || radar.naturalWidth === 0 || radar.clientHeight === 0 || radar.clientWidth === 0 ){
        return;
    }
    if(getActiveRadioButton().value == "victim"){
                renderDeathHeatmap(matchData, radar, config);
            }else {renderKillHeatmap(matchData, radar, config);}
}

function renderKillHeatmap(data, radar, config){

    const oldCanvases = document.getElementById("HC").querySelectorAll("canvas");
    oldCanvases.forEach(canvas => canvas.remove());

    config.radius = calcRad(radar);
    const points = createKillPoints(data, radar);

    const killHeatmapInstance = h337.create({
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

    const deathHeatmapInstance = h337.create({
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
    const maxRounds = data.finalScore.teamStartingCT + data.finalScore.teamStartingT;
    const pId = hmcombobox.value;
    const scaleX = radar.clientWidth / radar.naturalWidth;
    const scaleY = radar.clientHeight / radar.naturalHeight;

    return data.kills
        .filter(kill => kill.roundNumber <= maxRounds)
        .filter(kill => kill.haskiller && kill.killer.id !== kill.victim.id)
        .filter(kill => pId === "default" || kill.killer.id == pId)
        .map(kill => ({
            x: Math.round(kill.kposition.x * scaleX),
            y: Math.round(kill.kposition.y * scaleY),
            value: 1
        }));
}

function createDeathPoints(data, radar){
    const maxRounds = data.finalScore.teamStartingCT + data.finalScore.teamStartingT;
    const pId = hmcombobox.value;
    const scaleX = radar.clientWidth / radar.naturalWidth;
    const scaleY = radar.clientHeight / radar.naturalHeight;

    return data.kills
        .filter(kill => kill.roundNumber <= maxRounds)
        .filter(kill => pId === "default" || kill.victim.id == pId).map(kill => ({
        x: Math.round(kill.vposition.x * scaleX),
        y: Math.round(kill.vposition.y * scaleY),
        value: 1
    }));
}

function getActiveRadioButton(){
    return document.querySelector(`input[name=hm]:checked`)
}
function renderKillfeed(data, startingTeamCT, startingTeamT){
    const maxRounds = data.finalScore.teamStartingCT + data.finalScore.teamStartingT;
    let currentRound = 1;
    killfeed.append(document.createElement("p").textContent = `Runde ${currentRound} beginnt`);
    data.kills.forEach(kill => {
        const killEvent = document.createElement("div");
        const killer = document.createElement("span");
        const weapon = document.createElement("span");
        const victim = document.createElement("span");
        if (kill.roundNumber <= maxRounds){  
            if (kill.roundNumber !== currentRound){
                currentRound = kill.roundNumber;
                const newRound = document.createElement("p");
                newRound.textContent = `Runde ${currentRound} beginnt`
                killfeed.append(newRound);
            }
            if(kill.haskiller){ 
                killer.textContent = `${kill.killer.name.slice(0,10)}`;
            }else{ 
                killer.textContent = ``;
            }
            weapon.textContent = `${kill.weapon}`;
            victim.textContent = `${kill.victim.name.slice(0,10)}`;
            
            if(startingTeamCT.find(p => p.id == kill.victim.id)){
                victim.className = "ct"
            }else if (startingTeamT.find(p => p.id == kill.victim.id)){
                victim.className = "t"
            }
            if(kill.haskiller){
                if(startingTeamCT.find(p => p.id == kill.killer.id)){
                    killer.className = "ct"
                }else if (startingTeamT.find(p => p.id == kill.killer.id)){
                    killer.className = "t"
                }
            }else{
                killer.className = victim.className
            }

            if(kill.roundNumber >= 13 && kill.roundNumber <= 27){
                if(killer.className == "ct"){killer.className = "t"}
                else if(killer.className == "t"){killer.className = "ct"}

                if(victim.className == "ct"){victim.className = "t"}
                else if(victim.className == "t"){victim.className = "ct"}
            }
            killEvent.append(killer, weapon, victim)
            killfeed.append(killEvent);
        }
    })
}
function showChart(data, team){
    if (!data) {
        return;
    }

    const pId = chartcombobox.value;
    const rounds = data.rounds
    const labels = rounds.map(round => round.roundNumber)
    const money = rounds.map(round => {
        if (pId === "default"){
            return round.playerEconomy.filter(player => {
                return data.players.some(matchPlayer =>
                    matchPlayer.startingteam === team &&
                    String(matchPlayer.id) === String(player.id)
                );
            }).reduce((acc, currentValue) => acc + currentValue.money, 0,);
    }else{
        return round.playerEconomy.find(player => String(player.id) === String(pId)).money;
    }
    })
    if(moneyChart !== null){
        moneyChart.destroy();
    }
    moneyChart = new Chart(document.getElementById("chart"), {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Money at the start of every round",
                data: money
            }]

        }
    })
}
function displayStats(data){
    const t1body = document.querySelector("#table-team1 tbody");
    const t2body = document.querySelector("#table-team2 tbody");
    if(t1body != null){
        t1body.replaceChildren();
    }
    if(t2body != null){
        t2body.replaceChildren();
    }

    data.players.filter(player => player.startingteam === "CT").forEach(player => {
        const row = t1body.insertRow();

        [player.name.slice(0,10), player.stats.kills, player.stats.assists, player.stats.deaths, player.stats.damage, player.stats.udDamage, player.stats.mvps, (Math.round(player.stats.adr * 100)/100), (Math.round(player.stats.kd * 100)/100), (Math.round(player.stats.hsPercentage * 100)/100)]
        .forEach(value => {
            const cell = row.insertCell();
        cell.textContent = value;
        })
    })
    data.players.filter(player => player.startingteam === "T").forEach(player => {
        const row = t2body.insertRow();

        [player.name.slice(0,10), player.stats.kills, player.stats.assists, player.stats.deaths, player.stats.damage, player.stats.udDamage, player.stats.mvps, (Math.round(player.stats.adr * 100)/100), (Math.round(player.stats.kd * 100)/100), (Math.round(player.stats.hsPercentage * 100)/100)]
        .forEach(value => {
            const cell = row.insertCell();
        cell.textContent = value;
        })
    })
    

}

window.addEventListener("resize", () =>{
    
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
    updateHeatmap();
})

chartcombobox.addEventListener('change', () => {
    showChart(matchData, selectedTeamOfChart);
})

chartSwitcherRadioButton.addEventListener('change', (event) => {
    selectedTeamOfChart = event.target.value;
    emptyComboboxByTeam();
    fillComboboxByTeam(matchData);
    showChart(matchData, selectedTeamOfChart);
})




//Demodatei Upload
const demoFileInput = document.getElementById("demofile");
const uploadButton = document.getElementById("upload-button");
const loader = document.querySelector(".loader");
const container = document.querySelector(".container");
const upload = document.getElementById("upload");
const newDemo = document.getElementById("new-demo");
const navbar = document.getElementById("navbar");



uploadButton.addEventListener("click", async () => {
    const file = demoFileInput.files[0];

    if (!file) {
        alert("Please select a demo file.");
        return;
    }
    loader.hidden = false;
    uploadButton.disabled = true;

    

    try {

        const formData = new FormData();
        formData.append("demo", file);

        const response = await fetch("http://localhost:8080/api/upload", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Upload fehlgeschlagen.");
        }

        const data = await response.json();
        sessionStorage.setItem("matchData", JSON.stringify(data));

        showPage("heatmap");
        displayMatch(data);
    } catch (error) {
        console.error(error);
        alert("Die Datei konnte nicht hochgeladen werden.");
    }finally{
        loader.hidden = true;
        uploadButton.disabled = false;
    }
});

const savedMatchData = sessionStorage.getItem("matchData");
const savedPage = sessionStorage.getItem("activePage");
if(savedMatchData !== null){
    showPage(savedPage ?? "heatmap");
    displayMatch(JSON.parse(savedMatchData));
}else{showPage("upload")}

newDemo.addEventListener('click', (event) => {
    showPage("upload");
})

function showPage(id){
    const isUpload = id === "upload";
    upload.hidden = !isUpload;
    container.hidden = isUpload;
    newDemo.hidden = isUpload;
    navbar.hidden = isUpload;

    document.querySelectorAll("#navbar button").forEach(button => {
        button.classList.toggle("active", button.dataset.page === id);
    })

    document.querySelectorAll(".page").forEach(page => {
        page.hidden = page.id !== id;
    });
    if(id === "heatmap"){
        updateHeatmap();
    }
    sessionStorage.setItem("activePage", id);
}
navbar.addEventListener('click', event => {
    const button = event.target.closest("button[data-page]");
    if(!button) return;
    
    showPage(button.dataset.page);
})