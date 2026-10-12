package dto

type Kill struct {
	Killer         Player `json:"killer"`
	Victim         Player `json:"victim"`
	KillerPosition Pos    `json:"kposition"`
	VictimPosition Pos    `json:"vposition"`
	Weapon         string `json:"weapon"`
	Wallbang       bool   `json:"wallbang"`
	KillerAirborne bool   `json:"kairborne"`
}
