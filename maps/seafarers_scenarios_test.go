package maps

import "testing"

func TestScenarioStubMapNamesCount(t *testing.T) {
	stubs := ScenarioStubMapNames()
	if len(stubs) != 8 {
		t.Fatalf("expected 8 seafarers scenario stubs, got %d", len(stubs))
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

	if catalog[0].Title != SeafarersHeadingForNewShores || catalog[0].Placeholder {
		t.Fatalf("expected first catalog entry to be non-placeholder heading for new shores")
	}
}
