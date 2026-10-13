const hc = document.getElementById("HC");
const combobox = document.getElementById("combobox");
const killRadioButton = document.getElementById("kill");
const deathRadioButton = document.getElementById("death");
let radar = document.getElementById("radar");
let selectedPlayerId = "default";
let killHeatmapInstance;
let deathHeatmapInstance;
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
        document.getElementById("map").textContent = `Map: ${data.map}`;
        
        data.players.forEach(player =>{
            const option = document.createElement("option");
            option.value = player.id;
            option.textContent = player.name;
            combobox.add(option);
        });

        radar.onload = () => {    
            config.radius = calcRad(radar);
            updateHeatmap(); 
        };
        
        radar.src = `assets/radar/${data.map}.jpg`;
    })
    .catch(error => {
        console.error(error);
    });

function updateHeatmap(){
    if(getActiveRadioButton().value == "victim"){
                renderDeathHeatmap(matchData, radar, config);
            }else {renderKillHeatmap(matchData, radar, config);}
}

function renderKillHeatmap(data, radar, config){
    //Heatmap bereinigen

    //document.getElementById("killHC").querySelector("canvas").remove();
    const oldCanvases = document.querySelectorAll("canvas");
    oldCanvases.forEach(canvas => canvas.remove());

    config.radius = calcRad(radar);
    const points = createKillPoints(data, radar);

    //Heatmap erzeugen
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
    //Heatmap bereinigen
    const oldCanvases = document.querySelectorAll("canvas");
    oldCanvases.forEach(canvas => canvas.remove());
    
    config.radius = calcRad(radar);
    const points = createDeathPoints(data, radar);

    //Heatmap erzeugen
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
        .filter(kill => selectedPlayerId === "default" || kill.killer.id == selectedPlayerId)
        .map(kill => ({
            x: Math.round(kill.kposition.x * scaleX),
            y: Math.round(kill.kposition.y * scaleY),
            value: 1
        }));
}

function createDeathPoints(data, radar){
    const scaleX = radar.clientWidth / radar.naturalWidth;
    const scaleY = radar.clientHeight / radar.naturalHeight;

    return data.kills.filter(kill => selectedPlayerId === "default" || kill.victim.id == selectedPlayerId).map(kill => ({
        x: Math.round(kill.vposition.x * scaleX),
        y: Math.round(kill.vposition.y * scaleY),
        value: 1
    }));
}

function getActiveRadioButton(){
    return document.querySelector(`input[name=hm]:checked`)
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

combobox.addEventListener('change', () => {
    selectedPlayerId = combobox.value
    updateHeatmap();
})

/*

function repaintKillHeatmap(killHeatmapInstance, data, radar){
    killHeatmapInstance.configure({
        radius: calcRad(radar),
    })
    const points = createKillPoints(data, radar);
    killHeatmapInstance.setData({
        min: 0,
        max: 2.5,
        data: points
    });
    killHeatmapInstance.repaint();
}
function repaintDeathHeatmap(deathHeatmapInstance, data, radar){
    deathHeatmapInstance.configure({
        radius: calcRad(radar),
    })
    const points = createDeathPoints(data, radar);
    deathHeatmapInstance.setData({
        min: 0,
        max: 2.5,
        data: points
    });
    deathHeatmapInstance.repaint();
}

*/