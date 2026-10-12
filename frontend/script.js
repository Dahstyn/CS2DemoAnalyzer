const killHeatmapContainer = document.getElementById("killHC")
const deathHeatmapContainer = document.getElementById("deathHC")
let killHeatmapInstance;
let deathHeatmapInstance;
let matchData = null;
let radar = null;
let config = {
    radius: 0,
    maxOpacity: 0.6,
    minOpacity: 0.05,
    blur: 0.75,
    gradient: {
        ".3": "blue",
        ".6": "yellow",
        ".8": "red"
    }
};
            
fetch("http://localhost:8080/api/test")
    .then(res => { if(!res.ok) throw new Error(`HTTP-Fehler: ${res.status}`);
        return res.json()})
    .then(data => {
        matchData = data;
        document.getElementById("map").textContent = `Map: ${data.map}`;
        radar = document.getElementById("radar");
        
        config.radius = calcRad(radar);
        console.log(config.radius);
        radar.onload = () => {
            if(getActiveRadioButton().value == "victim"){
                renderDeathHeatmap(data, radar, config);
            }else {renderKillHeatmap(data, radar, config);}
            
        };
        
        radar.src = `assets/radar/${data.map}.jpg`;
    })
    .catch(error => {
        console.error(error);
    });


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
        container: HC,
    });

    killHeatmapInstance.setData({
        max: 3.5,
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
        container: HC,
    });


    deathHeatmapInstance.setData({
        max: 3.5,
        data: points
    });  
}
function calcRad(radar){
    return Math.min(20,Math.max(10, Math.round(radar.clientWidth * 0.025)))
}
function createKillPoints(data, radar){
    const scaleX = radar.clientWidth / radar.naturalWidth;
    const scaleY = radar.clientHeight / radar.naturalHeight;

    return data.kills.map(kill => ({
        x: Math.round(kill.kposition.x * scaleX),
        y: Math.round(kill.kposition.y * scaleY),
        value: 1
    }));
}

function createDeathPoints(data, radar){
    const scaleX = radar.clientWidth / radar.naturalWidth;
    const scaleY = radar.clientHeight / radar.naturalHeight;

    return data.kills.map(kill => ({
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

const killRadioButton = document.getElementById("kill");
const deathRadioButton = document.getElementById("death");

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




function repaintKillHeatmap(killHeatmapInstance, data, radar){
    killHeatmapInstance.configure({
        radius: Math.max(8, Math.round(radar.clientWidth * 0.025)),
    })
    const points = createKillPoints(data, radar);
    killHeatmapInstance.setData({
        max: 3.5,
        data: points
    });
    killHeatmapInstance.repaint();
}
function repaintDeathHeatmap(deathHeatmapInstance, data, radar){
    deathHeatmapInstance.configure({
        radius: Math.max(8, Math.round(radar.clientWidth * 0.025)),
    })
    const points = createDeathPoints(data, radar);
    deathHeatmapInstance.setData({
        max: 3.5,
        data: points
    });
    deathHeatmapInstance.repaint();
}