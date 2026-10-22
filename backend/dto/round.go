package dto

type Round struct {
	RoundNumber    int             `json:"roundNumber"`
	PlayerEconomy  []PlayerEconomy `json:"playerEconomy"`
	Winner         Team            `json:"winner"`
	RoundEndReason RoundEndReason  `json:"roundEndReason"`
}
