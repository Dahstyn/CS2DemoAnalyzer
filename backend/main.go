package main

import (
	"cs2demoanalyzer/dto"
	"encoding/json"
	"io"
	"net/http"
	"os"
)

var parsedMatchData dto.MatchData

func main() {
	http.HandleFunc("/api/test", handleMatchData)
	http.HandleFunc("/api/upload", handleUpload)

	http.ListenAndServe(":8080", nil)
}

func handleMatchData(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(parsedMatchData)
}

func handleUpload(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")

	if r.Method != http.MethodPost {
		http.Error(w, "Nur Post erlaubt.", http.StatusMethodNotAllowed)
		return
	}

	file, _, err := r.FormFile("demo")

	if r.MultipartForm != nil {
		defer r.MultipartForm.RemoveAll()
	}
	if err != nil {
		http.Error(w, "Datei konnte nicht empfangen werden.", http.StatusBadRequest)
		return
	}
	defer file.Close()
	targetFile, err := os.CreateTemp("demos", "upload-*.dem")
	if err != nil {
		http.Error(w, "Zieldatei konnte nicht erstellt werden", http.StatusInternalServerError)
		return
	}

	_, copyErr := io.Copy(targetFile, file)
	closeErr := targetFile.Close()

	if copyErr != nil || closeErr != nil {
		http.Error(w, "Datei konnte nicht gespeichert werden", http.StatusInternalServerError)
		return
	}
	var parsedMatchData dto.MatchData = parse(targetFile.Name())

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(parsedMatchData)
}

//de_inferno.jpg demos/match730_003811723246873608264_0837777596_271.dem
//de_dust2.jpg demos/match730_003814157793250771270_1636709847_273.dem
//de_mirage.jpg demos/match730_003825413160924348771_1730406319_272.dem
//de_anubis.jpg demos/match730_003826034198162964497_0558543582_274.dem
//de_nuke.jpg demos/match730_003817276467788644759_1945490060_192.dem
