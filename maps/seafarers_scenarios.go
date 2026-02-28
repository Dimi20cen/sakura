package maps

import (
	"encoding/json"
	"sakura/entities"
)

const (
	SeafarersFourIslands     = "Seafarers - The Four Islands"
	SeafarersFogIslands      = "Seafarers - The Fog Islands"
	SeafarersThroughDesert   = "Seafarers - Through the Desert"
	SeafarersForgottenTribe  = "Seafarers - The Forgotten Tribe"
	SeafarersClothForCatan   = "Seafarers - Cloth for Catan"
	SeafarersPirateIslands   = "Seafarers - The Pirate Islands"
	SeafarersWondersOfCatan  = "Seafarers - The Wonders of Catan"
	SeafarersNewWorldVariant = "Seafarers - New World Variant"
)

// ScenarioStubMapNames lists Phase-1 scenario stubs that are wired for data-model
// and map-loading integration but not yet full rules parity.
func ScenarioStubMapNames() []string {
	return []string{
		SeafarersForgottenTribe,
		SeafarersClothForCatan,
		SeafarersPirateIslands,
		SeafarersWondersOfCatan,
		SeafarersNewWorldVariant,
	}
}

func getSeafarersScenarioMapByName(name string) *entities.MapDefinition {
	var key string
	switch name {
	case SeafarersFourIslands:
		return getSeafarersFourIslandsMap()
	case SeafarersFogIslands:
		return getSeafarersFogIslandsMap()
	case SeafarersThroughDesert:
		return getSeafarersThroughDesertMap()
	case SeafarersForgottenTribe:
		key = "seafarers_forgotten_tribe"
	case SeafarersClothForCatan:
		key = "seafarers_cloth_for_catan"
	case SeafarersPirateIslands:
		key = "seafarers_pirate_islands"
	case SeafarersWondersOfCatan:
		key = "seafarers_wonders_of_catan"
	case SeafarersNewWorldVariant:
		key = "seafarers_new_world_variant"
	default:
		return nil
	}

	// Phase-1 placeholder: use a valid Seafarers layout while full scenario maps
	// and rules are implemented incrementally.
	defn := getSeafarersHeadingForNewShoresTemplate()
	if defn == nil {
		return nil
	}
	defn.Name = name
	defn.Scenario = &entities.ScenarioMetadata{
		Expansion:       "Seafarers",
		Key:             key,
		Title:           name,
		Placeholder:     true,
		VictoryRuleText: "Scenario-specific victory condition pending implementation.",
	}
	return defn
}

func getSeafarersHeadingForNewShoresTemplate() *entities.MapDefinition {
	var defn entities.MapDefinition
	if err := json.Unmarshal([]byte(seafarersHeadingForNewShores), &defn); err != nil {
		return nil
	}
	return &defn
}

func getSeafarersFourIslandsMap() *entities.MapDefinition {
	return &entities.MapDefinition{
		Name:    SeafarersFourIslands,
		Order:   []bool{false, true, false, true, false},
		Ports:   []entities.PortType{entities.PortTypeAny, entities.PortTypeAny, entities.PortTypeAny, entities.PortTypeWood, entities.PortTypeWool, entities.PortTypeOre},
		Numbers: []uint16{3, 4, 5, 6, 8, 9, 10, 11},
		// 9 random land tiles; one is desert and eight are resources.
		RandomTiles: []entities.TileType{
			entities.TileTypeDesert,
			entities.TileTypeWood,
			entities.TileTypeWood,
			entities.TileTypeBrick,
			entities.TileTypeBrick,
			entities.TileTypeWool,
			entities.TileTypeWheat,
			entities.TileTypeWheat,
			entities.TileTypeOre,
		},
		Map: [][]int{
			{int(entities.TileTypeNone), int(entities.TileTypeRandom), int(entities.TileTypeRandom), int(entities.TileTypeNone), int(entities.TileTypeNone)},
			{int(entities.TileTypeRandom), int(entities.TileTypeSea), int(entities.TileTypeSea), int(entities.TileTypeRandom), int(entities.TileTypeNone)},
			{int(entities.TileTypeSea), int(entities.TileTypeSea), int(entities.TileTypeRandom), int(entities.TileTypeSea), int(entities.TileTypeSea)},
			{int(entities.TileTypeRandom), int(entities.TileTypeSea), int(entities.TileTypeSea), int(entities.TileTypeRandom), int(entities.TileTypeNone)},
			{int(entities.TileTypeNone), int(entities.TileTypeRandom), int(entities.TileTypeRandom), int(entities.TileTypeNone), int(entities.TileTypeNone)},
		},
		Scenario: &entities.ScenarioMetadata{
			Expansion:       "Seafarers",
			Key:             "seafarers_four_islands",
			Title:           SeafarersFourIslands,
			Placeholder:     false,
			VictoryPoints:   13,
			VictoryRuleText: "If you have 13 or more VPs at any point during your turn, you win.",
		},
	}
}

func getSeafarersFogIslandsMap() *entities.MapDefinition {
	return &entities.MapDefinition{
		Name:  SeafarersFogIslands,
		Order: []bool{false, true, false, true, false},
		Ports: []entities.PortType{
			entities.PortTypeAny,
			entities.PortTypeAny,
			entities.PortTypeAny,
			entities.PortTypeWood,
			entities.PortTypeWool,
			entities.PortTypeOre,
		},
		Numbers: []uint16{2, 3, 3, 4, 4, 5, 5, 6, 8, 9, 10, 11, 12},
		// 11 random/fog-backed land tiles; fog is revealed on first adjacent route build.
		RandomTiles: []entities.TileType{
			entities.TileTypeDesert,
			entities.TileTypeWood,
			entities.TileTypeWood,
			entities.TileTypeBrick,
			entities.TileTypeBrick,
			entities.TileTypeWool,
			entities.TileTypeWool,
			entities.TileTypeWheat,
			entities.TileTypeWheat,
			entities.TileTypeOre,
			entities.TileTypeGold,
		},
		Map: [][]int{
			{int(entities.TileTypeNone), int(entities.TileTypeRandom), int(entities.TileTypeRandom), int(entities.TileTypeRandom), int(entities.TileTypeNone)},
			{int(entities.TileTypeRandom), int(entities.TileTypeSea), int(entities.TileTypeFog), int(entities.TileTypeSea), int(entities.TileTypeNone)},
			{int(entities.TileTypeRandom), int(entities.TileTypeSea), int(entities.TileTypeRandom), int(entities.TileTypeSea), int(entities.TileTypeRandom)},
			{int(entities.TileTypeNone), int(entities.TileTypeSea), int(entities.TileTypeFog), int(entities.TileTypeSea), int(entities.TileTypeNone)},
			{int(entities.TileTypeNone), int(entities.TileTypeRandom), int(entities.TileTypeRandom), int(entities.TileTypeRandom), int(entities.TileTypeNone)},
		},
		Scenario: &entities.ScenarioMetadata{
			Expansion:       "Seafarers",
			Key:             "seafarers_fog_islands",
			Title:           SeafarersFogIslands,
			Placeholder:     false,
			VictoryPoints:   12,
			VictoryRuleText: "If you have 12 or more VPs at any point during your turn, you win.",
		},
	}
}

func getSeafarersThroughDesertMap() *entities.MapDefinition {
	return &entities.MapDefinition{
		Name:  SeafarersThroughDesert,
		Order: []bool{false, true, false, true, false},
		Ports: []entities.PortType{
			entities.PortTypeAny,
			entities.PortTypeAny,
			entities.PortTypeAny,
			entities.PortTypeWood,
			entities.PortTypeBrick,
			entities.PortTypeWheat,
			entities.PortTypeWool,
			entities.PortTypeOre,
		},
		Numbers: []uint16{2, 3, 3, 4, 4, 5, 5, 6, 8, 9, 10, 10, 11, 12},
		// First-pass map: one large island separated by a desert strip, with outer sea and
		// additional islands represented by random land positions.
		RandomTiles: []entities.TileType{
			entities.TileTypeDesert,
			entities.TileTypeDesert,
			entities.TileTypeWood,
			entities.TileTypeWood,
			entities.TileTypeBrick,
			entities.TileTypeBrick,
			entities.TileTypeWool,
			entities.TileTypeWool,
			entities.TileTypeWheat,
			entities.TileTypeWheat,
			entities.TileTypeOre,
			entities.TileTypeOre,
			entities.TileTypeGold,
			entities.TileTypeGold,
			entities.TileTypeWood,
			entities.TileTypeWheat,
		},
		Map: [][]int{
			{int(entities.TileTypeNone), int(entities.TileTypeRandom), int(entities.TileTypeRandom), int(entities.TileTypeRandom), int(entities.TileTypeNone)},
			{int(entities.TileTypeRandom), int(entities.TileTypeSea), int(entities.TileTypeRandom), int(entities.TileTypeSea), int(entities.TileTypeRandom)},
			{int(entities.TileTypeRandom), int(entities.TileTypeSea), int(entities.TileTypeDesert), int(entities.TileTypeSea), int(entities.TileTypeRandom)},
			{int(entities.TileTypeRandom), int(entities.TileTypeSea), int(entities.TileTypeRandom), int(entities.TileTypeSea), int(entities.TileTypeRandom)},
			{int(entities.TileTypeNone), int(entities.TileTypeRandom), int(entities.TileTypeRandom), int(entities.TileTypeRandom), int(entities.TileTypeNone)},
		},
		Scenario: &entities.ScenarioMetadata{
			Expansion:       "Seafarers",
			Key:             "seafarers_through_the_desert",
			Title:           SeafarersThroughDesert,
			Placeholder:     false,
			VictoryPoints:   14,
			VictoryRuleText: "If you have 14 or more VPs at any point during your turn, you win.",
		},
	}
}

func GetSeafarersScenarioCatalog() []*entities.ScenarioMetadata {
	makeMeta := func(key, title string, placeholder bool, victoryPoints int, victoryText string) *entities.ScenarioMetadata {
		if victoryText == "" {
			victoryText = "Scenario-specific victory condition pending implementation."
		}
		return &entities.ScenarioMetadata{
			Expansion:       "Seafarers",
			Key:             key,
			Title:           title,
			Placeholder:     placeholder,
			VictoryPoints:   victoryPoints,
			VictoryRuleText: victoryText,
		}
	}

	return []*entities.ScenarioMetadata{
		makeMeta("seafarers_heading_for_new_shores", SeafarersHeadingForNewShores, false, 14, "If you have 14 or more VPs at any point during your turn, you win."),
		makeMeta("seafarers_four_islands", SeafarersFourIslands, false, 13, "If you have 13 or more VPs at any point during your turn, you win."),
		makeMeta("seafarers_fog_islands", SeafarersFogIslands, false, 12, "If you have 12 or more VPs at any point during your turn, you win."),
		makeMeta("seafarers_through_the_desert", SeafarersThroughDesert, false, 14, "If you have 14 or more VPs at any point during your turn, you win."),
		makeMeta("seafarers_forgotten_tribe", SeafarersForgottenTribe, true, 0, ""),
		makeMeta("seafarers_cloth_for_catan", SeafarersClothForCatan, true, 0, ""),
		makeMeta("seafarers_pirate_islands", SeafarersPirateIslands, true, 0, ""),
		makeMeta("seafarers_wonders_of_catan", SeafarersWondersOfCatan, true, 0, ""),
		makeMeta("seafarers_new_world_variant", SeafarersNewWorldVariant, true, 0, ""),
	}
}
