package main

import (
	"encoding/json"
	"net/http"
)

func main() {

	matchData := parse("demos/match730_003826034198162964497_0558543582_274.dem")

	http.HandleFunc("/api/test", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(matchData)
	})

	http.ListenAndServe(":8080", nil)

}

//de_inferno.jpg demos/match730_003811723246873608264_0837777596_271.dem
//de_dust2.jpg demos/match730_003814157793250771270_1636709847_273.dem
//de_mirage.jpg demos/match730_003825413160924348771_1730406319_272.dem
//de_anubis.jpg demos/match730_003826034198162964497_0558543582_274.dem
//de_nuke.jpg demos/match730_003817276467788644759_1945490060_192.dem

/*

	matchData := parse("demos/match730_003811723246873608264_0837777596_271.dem")

	http.HandleFunc("/api/test", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(matchData)
	})

	http.ListenAndServe(":8080", nil)





*/

/*



	fmt.Fprintln(w, "Map:", matchData.Map)
		for i := 0; i < len(matchData.Players); i++ {
			fmt.Fprintln(w, "Player: ", matchData.Players[i])
		}
	fmt.Println("Killer:", matchData.Kills[1].Killer.Name)
	fmt.Println("Killer:", matchData.Kills[1].Killer.Team)
	fmt.Println("KillerX:", matchData.Kills[1].KillerPosition.X)
	fmt.Println("KillerY:", matchData.Kills[1].KillerPosition.Y)
	fmt.Println("Victim:", matchData.Kills[1].Victim.Name)
	fmt.Println("Victim:", matchData.Kills[1].Victim.Team)
	fmt.Println("VictimX:", matchData.Kills[1].VictimPosition.X)
	fmt.Println("VictimY:", matchData.Kills[1].VictimPosition.Y)

*/
