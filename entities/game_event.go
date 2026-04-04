package entities

type GameEventType string

const (
	GameEventTypeDiceRolled         GameEventType = "dice_rolled"
	GameEventTypeResourcesReceived  GameEventType = "resources_received"
	GameEventTypeBuildPlaced        GameEventType = "build_placed"
	GameEventTypeDevCardBought      GameEventType = "dev_card_bought"
	GameEventTypeDevCardPlayed      GameEventType = "dev_card_played"
	GameEventTypeBankTradeCompleted GameEventType = "bank_trade_completed"
	GameEventTypePlayerTradeDone    GameEventType = "player_trade_completed"
	GameEventTypeCardsStolen        GameEventType = "cards_stolen"
	GameEventTypeCardsDiscarded     GameEventType = "cards_discarded"
	GameEventTypeRobberMoved        GameEventType = "robber_moved"
)

type GameEventCard struct {
	Type     CardType `msgpack:"t"`
	Quantity int      `msgpack:"q"`
}

type GameEvent struct {
	Seq               uint64              `msgpack:"s"`
	CreatedAtUnixMs   int64               `msgpack:"ts"`
	Type              GameEventType       `msgpack:"t"`
	ActorOrder        int                 `msgpack:"a"`
	TargetOrder       int                 `msgpack:"to"`
	CounterpartyOrder int                 `msgpack:"co"`
	BuildableType     BuildableType       `msgpack:"b"`
	DevelopmentCard   DevelopmentCardType `msgpack:"d"`
	RedRoll           int                 `msgpack:"rr"`
	WhiteRoll         int                 `msgpack:"wr"`
	EventRoll         int                 `msgpack:"er"`
	Token             string              `msgpack:"tk"`
	Resources         []GameEventCard     `msgpack:"r"`
	Given             []GameEventCard     `msgpack:"g"`
	Received          []GameEventCard     `msgpack:"rc"`
}

type GameEventHistory struct {
	Events []*GameEvent `msgpack:"e"`
}
