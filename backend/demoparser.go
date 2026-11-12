package main

import (
	"cs2demoanalyzer/dto"
	"os"

	ex "github.com/markus-wa/demoinfocs-golang/v6/examples"
	demoinfocs "github.com/markus-wa/demoinfocs-golang/v6/pkg/demoinfocs"
	"github.com/markus-wa/demoinfocs-golang/v6/pkg/demoinfocs/common"
	events "github.com/markus-wa/demoinfocs-golang/v6/pkg/demoinfocs/events"
	msg "github.com/markus-wa/demoinfocs-golang/v6/pkg/demoinfocs/msg"
)

func addStartingTeam(round dto.Round, players []dto.Player) {
	for _, economy := range round.PlayerEconomy {
		for i := range players {
			if players[i].ID == economy.ID {
				players[i].StartingTeam = economy.Team
				break
			}
		}
	}
}
func updatePlayerStats(players []dto.Player, participants []*common.Player, roundNumber int, headshotkills [10]int) {
	for _, p := range participants {
		for i := range players {
			if p != nil && p.Entity != nil {
				if p.UserID == players[i].ID {
					var kd float32
					var hsp float32 = 0
					if p.Kills() > 0 {
						hsp = float32(headshotkills[p.UserID]) / float32(p.Kills()) * 100
					}

					if p.Deaths() > 0 {
						kd = float32(p.Kills()) / float32(p.Deaths())
					} else {
						kd = float32(p.Kills())
					}
					players[i].Stats = &dto.Stats{
						Kills:         p.Kills(),
						Deaths:        p.Deaths(),
						Assists:       p.Assists(),
						Damage:        p.TotalDamage(),
						UtilityDamage: p.UtilityDamage(),
						MVPs:          p.MVPs(),
						ADR:           float32(p.TotalDamage()) / float32(roundNumber),
						KD:            kd,
						HSPercentage:  hsp,
					}
				}
			}

		}
	}
}

func parse(demoPath string) dto.MatchData {
	var matchData dto.MatchData
	var finalScore dto.Score
	var halftimeScore dto.Score
	var mapMetadata ex.Map
	var mapName string
	var kills []dto.Kill
	var players []dto.Player
	var rounds []dto.Round
	var roundNumber int = 0 // Durch parser.GameState().TotalRoundsPlayed() ersetzen
	var headshotKills [10]int
	file, err1 := os.Open(demoPath)
	checkError(err1)
	defer file.Close()

	parser := demoinfocs.NewParser(file)

	defer parser.Close()

	parser.RegisterNetMessageHandler(func(message *msg.CSVCMsg_ServerInfo) {
		mapMetadata = ex.GetMapMetadata(message.GetMapName())
		mapName = message.GetMapName()
	})
	parser.RegisterEventHandler(func(event events.Kill) {
		if event.Killer != nil && event.IsHeadshot {
			headshotKills[event.Killer.UserID]++

		}
		xk, yk := mapMetadata.TranslateScale(event.Killer.Position().X, event.Killer.Position().Y)
		xv, yv := mapMetadata.TranslateScale(event.Victim.Position().X, event.Victim.Position().Y)

		kill := dto.Kill{
			HasKiller: event.Killer != nil,
			Killer:    mapPlayer(event.Killer),
			Victim:    mapPlayer(event.Victim),
			KillerPosition: dto.Pos{
				X: xk,
				Y: yk,
			},
			VictimPosition: dto.Pos{
				X: xv,
				Y: yv,
			},
			Weapon:      event.Weapon.String(),
			RoundNumber: parser.GameState().TotalRoundsPlayed() + 1,
		}
		kills = append(kills, kill)
	})

	parser.RegisterEventHandler(func(con events.PlayerConnect) {
		player := mapPlayer(con.Player)
		players = append(players, player)
	})

	parser.RegisterEventHandler(func(rs events.RoundStart) {
		//Durch parser.GameState().TotalRoundsPlayed() ersetzen

		roundNumber++
		if roundNumber == 13 {
			ctHalftimeScore := parser.GameState().TeamCounterTerrorists().Score()
			tHalftimeScore := parser.GameState().TeamTerrorists().Score()
			halftimeScore = mapScore(ctHalftimeScore, tHalftimeScore)

		}
		round := mapRoundStart(roundNumber)
		for _, player := range parser.GameState().Participants().Playing() {
			round.PlayerEconomy = append(round.PlayerEconomy, mapPlayerEconomy(player))
		}
		if roundNumber == 1 {
			addStartingTeam(round, players)
		}
		rounds = append(rounds, round)

	})
	parser.RegisterEventHandler(func(re events.RoundEnd) {
		rounds[roundNumber-1].Winner = mapTeam(re.Winner)
		rounds[roundNumber-1].RoundEndReason = mapRoundEndReason(re.Reason)

	})

	parser.RegisterEventHandler(func(e events.AnnouncementWinPanelMatch) {
		roundNr := parser.GameState().TotalRoundsPlayed() + 1
		updatePlayerStats(players, parser.GameState().Participants().All(), roundNr, headshotKills)

	})
	err1 = parser.ParseToEnd()
	checkError(err1)

	ctScore := parser.GameState().TeamCounterTerrorists().Score()
	tScore := parser.GameState().TeamTerrorists().Score()
	finalScore = mapScore(ctScore, tScore)
	matchData = dto.MatchData{
		FinalScore:    finalScore,
		HalftimeScore: halftimeScore,
		Map:           mapName,
		Players:       players,
		Kills:         kills,
		Rounds:        rounds,
	}

	return matchData
}
