package entities

type Ship struct {
	Owner    *Player       `msgpack:"p"`
	Location *Edge         `msgpack:"e"`
	Type     BuildableType `msgpack:"t"`
}

func NewShip(e *Edge) *Ship {
	s := &Ship{Location: e}
	s.Type = BTShip
	return s
}

func (s *Ship) GetType() BuildableType {
	return BTShip
}

func (s *Ship) SetOwner(p *Player) {
	s.Owner = p
}

func (s *Ship) GetOwner() *Player {
	return s.Owner
}

func (s *Ship) GetLocation() *Edge {
	return s.Location
}
