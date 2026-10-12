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

// noch nicht in Benutzung
func addPlayer(p *common.Player, players *[]dto.Player) {
	if p == nil {
		return
	}
	for _, player := range *players {
		if player.ID == p.UserID {
			return
		}
	}
	*players = append(*players, mapPlayer(p))
}

func parse(demoPath string) dto.MatchData {

	var matchData dto.MatchData

	file, err1 := os.Open(demoPath)
	checkError(err1)
	defer file.Close()

	parser := demoinfocs.NewParser(file)

	defer parser.Close()

	var mapMetadata ex.Map
	var mapName string
	var kills []dto.Kill
	var players []dto.Player
	parser.RegisterNetMessageHandler(func(message *msg.CSVCMsg_ServerInfo) {
		mapMetadata = ex.GetMapMetadata(message.GetMapName())
		mapName = message.GetMapName()
	})
	//weiter befüllen + Teams der Spieler adden ohne overwrite
	parser.RegisterEventHandler(func(event events.Kill) {
		xk, yk := mapMetadata.TranslateScale(event.Killer.Position().X, event.Killer.Position().Y)
		xv, yv := mapMetadata.TranslateScale(event.Victim.Position().X, event.Victim.Position().Y)

		kill := dto.Kill{
			Killer: mapPlayer(event.Killer),
			Victim: mapPlayer(event.Victim),
			KillerPosition: dto.Pos{
				X: xk,
				Y: yk,
			},
			VictimPosition: dto.Pos{
				X: xv,
				Y: yv,
			},
		}
		kills = append(kills, kill)
	})

	parser.RegisterEventHandler(func(con events.PlayerConnect) {
		player := mapPlayer(con.Player)
		players = append(players, player)
	})

	err1 = parser.ParseToEnd()
	checkError(err1)

	//weiter befüllen
	matchData = dto.MatchData{
		Map:     mapName,
		Players: players,
		Kills:   kills,
	}

	return matchData
}
