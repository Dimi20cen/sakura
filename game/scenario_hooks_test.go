package game

import (
	"sakura/entities"
	"testing"
)

func TestScenarioVictoryTargetFromMetadata(t *testing.T) {
	g := &Game{
		Settings: entities.GameSettings{
			VictoryPoints: 10,
			MapDefn: &entities.MapDefinition{
				Scenario: &entities.ScenarioMetadata{
					VictoryPoints: 13,
				},
			},
		},
	}

	if got := g.getScenarioVictoryTarget(); got != 13 {
		t.Fatalf("expected scenario victory target 13, got %d", got)
	}
}

func TestScenarioVictoryTargetFallsBackToSettings(t *testing.T) {
	g := &Game{
		Settings: entities.GameSettings{
			VictoryPoints: 11,
		},
	}
	if got := g.getScenarioVictoryTarget(); got != 11 {
		t.Fatalf("expected default victory target 11, got %d", got)
	}
}

func TestScenarioVictoryEvaluatorOverridesDefault(t *testing.T) {
	p0, _ := entities.NewPlayer(entities.Seafarers, "p0", "p0", 0)
	p1, _ := entities.NewPlayer(entities.Seafarers, "p1", "p1", 1)

	g := &Game{
		Players:            []*entities.Player{p0, p1},
		CurrentPlayer:      p0,
		ScenarioHooks:      ScenarioHookSet{},
		ExtraVictoryPoints: &entities.ExtraVictoryPoints{},
	}

	g.ScenarioHooks.VictoryEvaluator = func(g *Game) *entities.Player {
		return p1
	}

	winner := g.getScenarioVictoryWinner()
	if winner != p1 {
		t.Fatal("expected scenario victory evaluator to select p1 as winner")
	}
}

func TestScenarioInitFiltersApplied(t *testing.T) {
	p0, _ := entities.NewPlayer(entities.Seafarers, "p0", "p0", 0)
	v1 := &entities.Vertex{}
	v2 := &entities.Vertex{}
	e1 := &entities.Edge{}
	e2 := &entities.Edge{}

	g := &Game{
		ScenarioHooks: ScenarioHookSet{
			FilterInitVertices: func(g *Game, p *entities.Player, allowed []*entities.Vertex) []*entities.Vertex {
				return allowed[:1]
			},
			FilterInitEdges: func(g *Game, p *entities.Player, allowed []*entities.Edge) []*entities.Edge {
				return allowed[:1]
			},
		},
	}

	filteredVertices := g.applyInitVertexScenarioHooks(p0, []*entities.Vertex{v1, v2})
	if len(filteredVertices) != 1 || filteredVertices[0] != v1 {
		t.Fatal("expected init vertex filter hook to be applied")
	}

	filteredEdges := g.applyInitEdgeScenarioHooks(p0, []*entities.Edge{e1, e2})
	if len(filteredEdges) != 1 || filteredEdges[0] != e1 {
		t.Fatal("expected init edge filter hook to be applied")
	}
}
