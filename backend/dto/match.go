package dto

type MatchData struct {
	FinalScore    Score    `json:"finalScore"`
	HalftimeScore Score    `json:"halftimeScore"`
	Map           string   `json:"map"`
	Players       []Player `json:"players"`
	Kills         []Kill   `json:"kills"`
	Rounds        []Round  `json:"rounds"`
}
