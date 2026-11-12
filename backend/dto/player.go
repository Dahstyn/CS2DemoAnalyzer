package dto

type Player struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	StartingTeam Team   `json:"startingteam"`
	SteamID64    string `json:"steamid64"`
	Stats        *Stats `json:"stats,omitempty"`
}
