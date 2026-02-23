package entities

type (
	Robber struct {
		Tile *Tile `msgpack:"t"`
	}

	Pirate struct {
		Tile *Tile `msgpack:"t"`
	}
)

func (r *Robber) Move(tile *Tile) {
	r.Tile = tile
}

func (p *Pirate) Move(tile *Tile) {
	p.Tile = tile
}

type (
	Merchant struct {
		Tile  *Tile   `msgpack:"t"`
		Owner *Player `msgpack:"p"`
	}
)

func (r *Merchant) Move(owner *Player, tile *Tile) {
	r.Owner = owner
	r.Tile = tile
}
