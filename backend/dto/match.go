package dto

type MatchData struct {
	Map     string   `json:"map"`
	Players []Player `json:"players"`
	Kills   []Kill   `json:"kills"`
}
