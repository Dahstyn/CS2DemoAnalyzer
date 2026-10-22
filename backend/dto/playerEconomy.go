package dto

type PlayerEconomy struct {
	ID    int  `json:"id"`
	Team  Team `json:"team"`
	Money int  `json:"money"`
}
