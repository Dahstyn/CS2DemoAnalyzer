package main

import (
	"image"
	"image/draw"
	"image/jpeg"
	"os"

	r2 "github.com/golang/geo/r2"
	heatmap "github.com/markus-wa/go-heatmap/v2"
	schemes "github.com/markus-wa/go-heatmap/v2/schemes"

	ex "github.com/markus-wa/demoinfocs-golang/v6/examples"
	demoinfocs "github.com/markus-wa/demoinfocs-golang/v6/pkg/demoinfocs"
	events "github.com/markus-wa/demoinfocs-golang/v6/pkg/demoinfocs/events"
	msg "github.com/markus-wa/demoinfocs-golang/v6/pkg/demoinfocs/msg"
)

const (
	dotSize     = 15
	opacity     = 128
	jpegQuality = 90
)

// Run like this: go run heatmap.go -demo /path/to/demo.dem > out.jpg
// Run like this if stdout creates corrupted image : go run . -demo /path/to/demo.dem
func createHeatmap() {
	//
	// Parsing
	//
	f, err := os.Open(ex.DemoPathFromArgs())
	checkError(err)

	defer f.Close()

	p := demoinfocs.NewParser(f)
	defer p.Close()

	var (
		mapMetadata ex.Map
		mapRadarImg image.Image
	)

	p.RegisterNetMessageHandler(func(msg *msg.CSVCMsg_ServerInfo) {
		// Get metadata for the map that the game was played on for coordinate translations
		mapMetadata = ex.GetMapMetadata(msg.GetMapName())

		// Load map overview image
		mapRadarImg = ex.GetMapRadar(msg.GetMapName())
	})

	// Register handler for WeaponFire, triggered every time a shot is fired
	var points []r2.Point

	p.RegisterEventHandler(func(e events.WeaponFire) {
		// Translate positions from in-game coordinates to radar overview image pixels
		x, y := mapMetadata.TranslateScale(e.Shooter.Position().X, e.Shooter.Position().Y)

		points = append(points, r2.Point{X: x, Y: y})
	})

	// Parse the whole demo
	err = p.ParseToEnd()
	checkError(err)

	//
	// Preparation of heatmap data
	//

	// Find bounding rectangle for points to get around the normalization done by the heatmap library
	r2Bounds := r2.RectFromPoints(points...)
	padding := float64(dotSize) / 2.0 // Calculating padding amount to avoid shrinkage by the heatmap library
	bounds := image.Rectangle{
		Min: image.Point{X: int(r2Bounds.X.Lo - padding), Y: int(r2Bounds.Y.Lo - padding)},
		Max: image.Point{X: int(r2Bounds.X.Hi + padding), Y: int(r2Bounds.Y.Hi + padding)},
	}

	// Transform r2.Points into heatmap.DataPoints
	data := make([]heatmap.DataPoint, 0, len(points))

	for _, p := range points[1:] {
		// Invert Y since go-heatmap expects data to be ordered from bottom to top
		data = append(data, heatmap.P(p.X, p.Y*-1))
	}

	//
	// Drawing the image
	//

	// Create output canvas and use map overview image as base
	img := image.NewRGBA(mapRadarImg.Bounds())
	draw.Draw(img, mapRadarImg.Bounds(), mapRadarImg, image.Point{}, draw.Over)

	// Generate and draw heatmap overlay on top of the overview
	imgHeatmap := heatmap.Heatmap(image.Rect(0, 0, bounds.Dx(), bounds.Dy()), data, dotSize, opacity, schemes.AlphaFire)
	draw.Draw(img, bounds, imgHeatmap, image.Point{}, draw.Over)

	//Create File
	file, err := os.Create("heatmap.jpg")
	checkError(err)

	//Write to File (stdout creates courrupted image)
	err = jpeg.Encode(file, img, &jpeg.Options{Quality: jpegQuality})
	checkError(err)

	file.Close()
	// Write to stdout (wasn´t working)
	//err = jpeg.Encode(os.Stdout, img, &jpeg.Options{Quality: jpegQuality})
	//checkError(err)
}

func createRadarImage(demoPath string) {
	f, err := os.Open(demoPath)
	checkError(err)

	defer f.Close()

	p := demoinfocs.NewParser(f)

	defer p.Close()

	var radarImg image.Image

	p.RegisterNetMessageHandler(func(msg *msg.CSVCMsg_ServerInfo) {
		radarImg = ex.GetMapRadar(msg.GetMapName())
	})

	err = p.ParseToEnd()
	checkError(err)

	file, err := os.Create("radar.jpg")
	checkError(err)

	err = jpeg.Encode(file, radarImg, &jpeg.Options{Quality: jpegQuality})
	checkError(err)
	file.Close()

}

func checkError(err error) {
	if err != nil {
		panic(err)
	}
}
