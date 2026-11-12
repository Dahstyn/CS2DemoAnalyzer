package dto

type Stats struct {
	Kills         int     `json:"kills"`
	Deaths        int     `json:"deaths"`
	Assists       int     `json:"assists"`
	Damage        int     `json:"damage"`
	UtilityDamage int     `json:"udDamage"`
	MVPs          int     `json:"mvps"`
	ADR           float32 `json:"adr"`
	KD            float32 `json:"kd"`
	HSPercentage  float32 `json:"hsPercentage"`
}
