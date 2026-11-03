package dto

type Player struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	StartingTeam Team   `json:"startingteam"`
}
