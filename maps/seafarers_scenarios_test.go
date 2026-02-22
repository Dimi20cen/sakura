package maps

import "testing"

func TestScenarioStubMapNamesCount(t *testing.T) {
	stubs := ScenarioStubMapNames()
	if len(stubs) != 7 {
		t.Fatalf("expected 7 seafarers scenario stubs, got %d", len(stubs))
	}
}

func TestGetMapByNameSeafarersStubHasScenarioMetadata(t *testing.T) {
	stubNames := ScenarioStubMapNames()
	for _, name := range stubNames {
		defn := GetMapByName(name)
		if defn == nil {
			t.Fatalf("expected stub map for %q", name)
		}
		if defn.Scenario == nil {
			t.Fatalf("expected scenario metadata for %q", name)
		}
		if !defn.Scenario.Placeholder {
			t.Fatalf("expected placeholder scenario for %q", name)
		}
	}
}

func TestGetSeafarersScenarioCatalog(t *testing.T) {
	catalog := GetSeafarersScenarioCatalog()
	if len(catalog) != 9 {
		t.Fatalf("expected 9 seafarers catalog entries, got %d", len(catalog))
	}

	if catalog[0].Title != SeafarersHeadingForNewShores || catalog[0].Placeholder || catalog[0].VictoryPoints != 12 {
		t.Fatalf("expected first catalog entry to be non-placeholder heading for new shores")
	}
	if catalog[1].Title != SeafarersFourIslands || catalog[1].Placeholder || catalog[1].VictoryPoints != 12 {
		t.Fatalf("expected second catalog entry to be non-placeholder four islands")
	}
}

func TestGetMapByNameSeafarersFourIslandsIsPlayable(t *testing.T) {
	defn := GetMapByName(SeafarersFourIslands)
	if defn == nil {
		t.Fatal("expected four islands map")
	}
	if defn.Scenario == nil || defn.Scenario.Placeholder {
		t.Fatal("expected four islands map to be non-placeholder with scenario metadata")
	}
	if defn.Scenario.VictoryPoints != 12 {
		t.Fatalf("expected four islands victory points override 12, got %d", defn.Scenario.VictoryPoints)
	}
}
