package main

import (
	"cs2demoanalyzer/dto"
	"log"
	"net/http"
)

var parsedMatchData dto.MatchData

func main() {
	http.HandleFunc("/api/upload", handleUpload)

	log.Fatal(http.ListenAndServe(":8080", nil))
}
