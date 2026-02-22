package maps

import "testing"

func TestScenarioStubMapNamesCount(t *testing.T) {
	stubs := ScenarioStubMapNames()
	if len(stubs) != 5 {
		t.Fatalf("expected 5 seafarers scenario stubs, got %d", len(stubs))
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
	if catalog[2].Title != SeafarersFogIslands || catalog[2].Placeholder || catalog[2].VictoryPoints != 12 {
		t.Fatalf("expected third catalog entry to be non-placeholder fog islands")
	}
	if catalog[3].Title != SeafarersThroughDesert || catalog[3].Placeholder || catalog[3].VictoryPoints != 14 {
		t.Fatalf("expected fourth catalog entry to be non-placeholder through the desert")
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

func TestGetMapByNameSeafarersFogIslandsIsPlayable(t *testing.T) {
	defn := GetMapByName(SeafarersFogIslands)
	if defn == nil {
		t.Fatal("expected fog islands map")
	}
	if defn.Scenario == nil || defn.Scenario.Placeholder {
		t.Fatal("expected fog islands map to be non-placeholder with scenario metadata")
	}
	if defn.Scenario.VictoryPoints != 12 {
		t.Fatalf("expected fog islands victory points override 12, got %d", defn.Scenario.VictoryPoints)
	}
}

func TestGetMapByNameSeafarersThroughDesertIsPlayable(t *testing.T) {
	defn := GetMapByName(SeafarersThroughDesert)
	if defn == nil {
		t.Fatal("expected through the desert map")
	}
	if defn.Scenario == nil || defn.Scenario.Placeholder {
		t.Fatal("expected through the desert map to be non-placeholder with scenario metadata")
	}
	if defn.Scenario.VictoryPoints != 14 {
		t.Fatalf("expected through the desert victory points override 14, got %d", defn.Scenario.VictoryPoints)
	}
}

func TestOfficialMapNamesIncludeCurrentSeafarersSet(t *testing.T) {
	names := GetOfficialMapNames()
	required := map[string]bool{
		BaseMapName:                  false,
		SeafarersHeadingForNewShores: false,
		SeafarersFourIslands:         false,
		SeafarersFogIslands:          false,
		SeafarersThroughDesert:       false,
	}

	for _, n := range names {
		if _, ok := required[n]; ok {
			required[n] = true
		}
	}

	for name, found := range required {
		if !found {
			t.Fatalf("expected official map list to include %q", name)
		}
	}
}
