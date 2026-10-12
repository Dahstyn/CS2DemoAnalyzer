package main

import (
	"cs2demoanalyzer/dto"

	"github.com/markus-wa/demoinfocs-golang/v6/pkg/demoinfocs/common"
	"github.com/markus-wa/demoinfocs-golang/v6/pkg/demoinfocs/events"
)

func mapTeam(t common.Team) dto.Team {
	switch t {
	case common.TeamCounterTerrorists:
		return dto.TeamCT
	case common.TeamTerrorists:
		return dto.TeamT
	case common.TeamSpectators:
		return dto.TeamSpectator
	case common.TeamUnassigned:
		return dto.TeamUnassigned
	default:
		return dto.TeamUnassigned
	}
}

// p.GetTeam() = nil abfangen
func mapPlayer(p *common.Player) dto.Player {
	return dto.Player{
		ID:   p.UserID,
		Name: p.Name,
		//Team: mapTeam(p.GetTeam()),
	}
}

func mapRoundEndReason(r events.RoundEndReason) dto.RoundEndReason {
	switch r {
	case events.RoundEndReasonStillInProgress:
		return dto.RoundEndReasonStillInProgress
	case events.RoundEndReasonTargetBombed:
		return dto.RoundEndReasonTargetBombed
	case events.RoundEndReasonVIPEscaped:
		return dto.RoundEndReasonVIPEscaped
	case events.RoundEndReasonVIPKilled:
		return dto.RoundEndReasonVIPKilled
	case events.RoundEndReasonTerroristsEscaped:
		return dto.RoundEndReasonTerroristsEscaped
	case events.RoundEndReasonCTStoppedEscape:
		return dto.RoundEndReasonCTStoppedEscape
	case events.RoundEndReasonTerroristsStopped:
		return dto.RoundEndReasonTerroristsStopped
	case events.RoundEndReasonBombDefused:
		return dto.RoundEndReasonBombDefused
	case events.RoundEndReasonCTWin:
		return dto.RoundEndReasonCTWin
	case events.RoundEndReasonTerroristsWin:
		return dto.RoundEndReasonTerroristsWin
	case events.RoundEndReasonDraw:
		return dto.RoundEndReasonDraw
	case events.RoundEndReasonHostagesRescued:
		return dto.RoundEndReasonHostagesRescued
	case events.RoundEndReasonTargetSaved:
		return dto.RoundEndReasonTargetSaved
	case events.RoundEndReasonHostagesNotRescued:
		return dto.RoundEndReasonHostagesNotRescued
	case events.RoundEndReasonTerroristsNotEscaped:
		return dto.RoundEndReasonTerroristsNotEscaped
	case events.RoundEndReasonVIPNotEscaped:
		return dto.RoundEndReasonVIPNotEscaped
	case events.RoundEndReasonGameStart:
		return dto.RoundEndReasonGameStart
	case events.RoundEndReasonTerroristsSurrender:
		return dto.RoundEndReasonTerroristsSurrender
	case events.RoundEndReasonCTSurrender:
		return dto.RoundEndReasonCTSurrender
	case events.RoundEndReasonTerroristsPlanted:
		return dto.RoundEndReasonTerroristsPlanted
	case events.RoundEndReasonCTsReachedHostage:
		return dto.RoundEndReasonCTsReachedHostage
	default:
		return dto.RoundEndReasonStillInProgress
	}
}
