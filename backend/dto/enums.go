package dto

type Team string

const (
	TeamCT         Team = "CT"
	TeamT          Team = "T"
	TeamSpectator  Team = "SPECTATOR"
	TeamUnassigned Team = "UNASSIGNED"
)

type RoundEndReason string

const (
	RoundEndReasonStillInProgress      RoundEndReason = "IN_PROGRESS"
	RoundEndReasonTargetBombed         RoundEndReason = "TARGET_BOMBED"
	RoundEndReasonVIPEscaped           RoundEndReason = "VIP_ESCAPED"
	RoundEndReasonVIPKilled            RoundEndReason = "VIP_KILLED"
	RoundEndReasonTerroristsEscaped    RoundEndReason = "T_ESCAPED"
	RoundEndReasonCTStoppedEscape      RoundEndReason = "CT_STOPPED_ESCAPE"
	RoundEndReasonTerroristsStopped    RoundEndReason = "T_STOPPED"
	RoundEndReasonBombDefused          RoundEndReason = "BOMB_DEFUSED"
	RoundEndReasonCTWin                RoundEndReason = "CT_WIN"
	RoundEndReasonTerroristsWin        RoundEndReason = "T_WIN"
	RoundEndReasonDraw                 RoundEndReason = "DRAW"
	RoundEndReasonHostagesRescued      RoundEndReason = "H_RESCUED"
	RoundEndReasonTargetSaved          RoundEndReason = "TARGET_SAVED"
	RoundEndReasonHostagesNotRescued   RoundEndReason = "13"
	RoundEndReasonTerroristsNotEscaped RoundEndReason = "H_NOT_RESCUED"
	RoundEndReasonVIPNotEscaped        RoundEndReason = "VIP_NOT_ESCAPED"
	RoundEndReasonGameStart            RoundEndReason = "GAME_START"
	RoundEndReasonTerroristsSurrender  RoundEndReason = "T_SURRENDER"
	RoundEndReasonCTSurrender          RoundEndReason = "CT_SURRENDER"
	RoundEndReasonTerroristsPlanted    RoundEndReason = "T_PLANED"
	RoundEndReasonCTsReachedHostage    RoundEndReason = "CT_REACHED_H"
)
