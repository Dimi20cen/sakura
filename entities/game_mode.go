package entities

type GameMode uint16

const (
	Base               GameMode = 1
	CitiesAndKnights   GameMode = 2
	Seafarers          GameMode = 3
	IQBaseResource     int16    = 19
	IQBaseKnight       int16    = 14
	IQBaseVP           int16    = 5
	IQBaseRoadBuilding int16    = 2
	IQBaseYearOfPlenty int16    = 2
	IQBaseMonopoly     int16    = 2

	IQCKCommodity int16 = 12

	SlowSpeed   string = "slow"
	NormalSpeed string = "normal"
	FastSpeed   string = "fast"

	Speed15s  string = "15s"
	Speed30s  string = "30s"
	Speed60s  string = "60s"
	Speed120s string = "120s"
	Speed200m string = "200m"
)

type GameSettings struct {
	Mode          GameMode
	Private       bool
	MapName       string
	DiscardLimit  int16
	VictoryPoints int
	SpecialBuild  bool
	MaxPlayers    int
	EnableKarma   bool
	CreativeMode  bool
	Speed         string
	Advanced      bool
	MapDefn       *MapDefinition `json:"-" msgpack:"-"`
}

type AdvancedSettings struct {
	RerollOn7 bool
}

var SpeedMultiplier = map[string]float32{
	Speed15s:  0.25,
	Speed30s:  0.5,
	Speed60s:  1,
	Speed120s: 2,
	Speed200m: 200,
	// Backward compatibility for older persisted rooms.
	SlowSpeed:   2,
	NormalSpeed: 1,
	FastSpeed:   0.5,
}
