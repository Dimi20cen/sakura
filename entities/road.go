package entities

type Road struct {
	Owner    *Player       `msgpack:"p"`
	Location *Edge         `msgpack:"e"`
	Type     BuildableType `msgpack:"t"`
}

func NewRoad(e *Edge) *Road {
	r := &Road{Location: e}
	r.Type = BTRoad
	return r
}

func (r *Road) GetType() BuildableType {
	return BTRoad
}

func (r *Road) SetOwner(p *Player) {
	r.Owner = p
}

func (r *Road) GetOwner() *Player {
	return r.Owner
}

func (r *Road) GetLocation() *Edge {
	return r.Location
}

func (p *Player) GetBuildLocationsRoad(g *Graph, init bool) []*Edge {
	edges := make(map[*Edge]bool)

	for _, vp := range p.VertexPlacements {
		v := vp.GetLocation()

		hasRoad := func(v *Vertex) bool {
			for _, e := range g.GetAdjacentVertexEdges(v) {
				if e.Placement != nil {
					return true
				}
			}
			return false
		}

		if init && hasRoad(v) {
			continue
		}

		for _, e := range g.GetAdjacentVertexEdges(v) {
			if e.Placement == nil && e.IsLandEdge() {
				edges[e] = true
			}
		}
	}

	addVertex := func(c *Coordinate) {
		v, _ := g.GetVertex(*c)
		if v != nil && (v.Placement == nil || v.Placement.GetOwner() == p) {
			for _, adjE := range g.GetAdjacentVertexEdges(v) {
				if adjE.Placement == nil && adjE.IsLandEdge() {
					edges[adjE] = true
				}
			}
		}
	}

	if !init {
		for _, ep := range p.EdgePlacements {
			if ep.GetType() != BTRoad {
				continue
			}
			e := ep.GetLocation()

			addVertex(&e.C.C1)
			addVertex(&e.C.C2)
		}
	}

	keys := make([]*Edge, 0, len(edges))
	for k := range edges {
		keys = append(keys, k)
	}
	return keys
}

func (p *Player) GetBuildLocationsShip(g *Graph) []*Edge {
	edges := make(map[*Edge]bool)

	addVertex := func(c *Coordinate) {
		v, _ := g.GetVertex(*c)
		if v == nil || (v.Placement != nil && v.Placement.GetOwner() != p) {
			return
		}

		for _, adjE := range g.GetAdjacentVertexEdges(v) {
			if adjE.Placement == nil && adjE.IsWaterEdge() {
				edges[adjE] = true
			}
		}
	}

	// Coastal settlements/cities can start shipping routes.
	for _, vp := range p.VertexPlacements {
		if vp.GetType() != BTSettlement && vp.GetType() != BTCity {
			continue
		}
		if vp.GetLocation().HasAdjacentSea() {
			addVertex(&vp.GetLocation().C)
		}
	}

	// Existing ships can extend the route.
	for _, ep := range p.EdgePlacements {
		if ep.GetType() != BTShip {
			continue
		}
		e := ep.GetLocation()
		addVertex(&e.C.C1)
		addVertex(&e.C.C2)
	}

	keys := make([]*Edge, 0, len(edges))
	for k := range edges {
		keys = append(keys, k)
	}
	return keys
}

func (r *Road) GetVertices(g *Graph) (v1, v2 *Vertex) {
	e := r.GetLocation()
	v1, err1 := g.GetVertex(e.C.C1)
	v2, err2 := g.GetVertex(e.C.C2)

	if err1 != nil || err2 != nil {
		panic("invalid road")
	}

	return v1, v2
}

func (r *Road) GetAdjacentRoads(g *Graph, v *Vertex) []*Road {
	adjRoads := make(map[*Road]bool)
	v1, v2 := r.GetVertices(g)

	if v1 != v && v2 != v {
		return make([]*Road, 0)
	}

	adjRoadsForVertex := func(v *Vertex) {
		adjEdges := g.GetAdjacentVertexEdges(v)

		for _, adj := range adjEdges {
			if adj.Placement != nil && adj.Placement.GetType() == BTRoad && adj.Placement.GetOwner() == r.GetOwner() && adj.Placement != r {
				adjRoads[adj.Placement.(*Road)] = true
			}
		}
	}

	if v.Placement == nil || v.Placement.GetOwner() == r.GetOwner() {
		adjRoadsForVertex(v)
	}

	keys := make([]*Road, 0, len(adjRoads))
	for k := range adjRoads {
		keys = append(keys, k)
	}
	return keys
}

func (p *Player) GetLongestRoad(g *Graph) int {
	if len(p.EdgePlacements) == 0 {
		return 0
	}

	owned := make([]EdgeBuildable, 0, len(p.EdgePlacements))
	for _, ep := range p.EdgePlacements {
		if ep.GetType() == BTRoad || ep.GetType() == BTShip {
			owned = append(owned, ep)
		}
	}
	if len(owned) == 0 {
		return 0
	}

	canTransition := func(at *Vertex, from, to EdgeBuildable) bool {
		// Enemy settlement/city blocks passing through this vertex.
		if at.Placement != nil && at.Placement.GetOwner() != p &&
			(at.Placement.GetType() == BTSettlement || at.Placement.GetType() == BTCity) {
			return false
		}

		if from.GetType() == to.GetType() {
			return true
		}

		// Road<->Ship transition requires own settlement/city on the junction.
		return at.Placement != nil &&
			at.Placement.GetOwner() == p &&
			(at.Placement.GetType() == BTSettlement || at.Placement.GetType() == BTCity)
	}

	getVertices := func(e EdgeBuildable) (*Vertex, *Vertex) {
		v1, _ := g.GetVertex(e.GetLocation().C.C1)
		v2, _ := g.GetVertex(e.GetLocation().C.C2)
		return v1, v2
	}

	getOtherVertex := func(e EdgeBuildable, at *Vertex) *Vertex {
		v1, v2 := getVertices(e)
		if v1 == at {
			return v2
		}
		return v1
	}

	getAdjacent := func(current EdgeBuildable, at *Vertex) []EdgeBuildable {
		if at == nil {
			return []EdgeBuildable{}
		}

		adj := make([]EdgeBuildable, 0)
		for _, e := range g.GetAdjacentVertexEdges(at) {
			if e.Placement == nil || e.Placement == current || e.Placement.GetOwner() != p {
				continue
			}
			t := e.Placement.GetType()
			if t != BTRoad && t != BTShip {
				continue
			}
			if canTransition(at, current, e.Placement) {
				adj = append(adj, e.Placement)
			}
		}
		return adj
	}

	visited := make(map[EdgeBuildable]bool, len(owned))
	var dfs func(current EdgeBuildable, at *Vertex) int
	dfs = func(current EdgeBuildable, at *Vertex) int {
		visited[current] = true
		best := 0
		for _, next := range getAdjacent(current, at) {
			if visited[next] {
				continue
			}
			l := dfs(next, getOtherVertex(next, at))
			if l > best {
				best = l
			}
		}
		visited[current] = false
		return 1 + best
	}

	longest := 0
	for _, e := range owned {
		v1, v2 := getVertices(e)
		l1 := dfs(e, v1)
		l2 := dfs(e, v2)
		if l1 > longest {
			longest = l1
		}
		if l2 > longest {
			longest = l2
		}
	}

	return longest
}
