package dto

type Round struct {
	Winner         Team           `json:"winner"`
	RoundEndReason RoundEndReason `json:"roundEndReason"`
	MVP            Player         `json:"mvp"`
}
