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
	http.HandleFunc("/api/upload", handleUpload)

	http.ListenAndServe(":8080", nil)
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
	targetFile, err := os.CreateTemp("demosTemp", "upload-*.dem")
	if err != nil {
		http.Error(w, "Zieldatei konnte nicht erstellt werden", http.StatusInternalServerError)
		return
	}
	defer os.Remove(targetFile.Name())

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
