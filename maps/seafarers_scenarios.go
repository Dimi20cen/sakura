package maps

import "imperials/entities"

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
		SeafarersFourIslands,
		SeafarersFogIslands,
		SeafarersThroughDesert,
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
		key = "seafarers_four_islands"
	case SeafarersFogIslands:
		key = "seafarers_fog_islands"
	case SeafarersThroughDesert:
		key = "seafarers_through_the_desert"
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
	defn := GetMapByName(SeafarersHeadingForNewShores)
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

func GetSeafarersScenarioCatalog() []*entities.ScenarioMetadata {
	makeMeta := func(key, title string, placeholder bool) *entities.ScenarioMetadata {
		return &entities.ScenarioMetadata{
			Expansion:       "Seafarers",
			Key:             key,
			Title:           title,
			Placeholder:     placeholder,
			VictoryRuleText: "Scenario-specific victory condition pending implementation.",
		}
	}

	return []*entities.ScenarioMetadata{
		makeMeta("seafarers_heading_for_new_shores", SeafarersHeadingForNewShores, false),
		makeMeta("seafarers_four_islands", SeafarersFourIslands, true),
		makeMeta("seafarers_fog_islands", SeafarersFogIslands, true),
		makeMeta("seafarers_through_the_desert", SeafarersThroughDesert, true),
		makeMeta("seafarers_forgotten_tribe", SeafarersForgottenTribe, true),
		makeMeta("seafarers_cloth_for_catan", SeafarersClothForCatan, true),
		makeMeta("seafarers_pirate_islands", SeafarersPirateIslands, true),
		makeMeta("seafarers_wonders_of_catan", SeafarersWondersOfCatan, true),
		makeMeta("seafarers_new_world_variant", SeafarersNewWorldVariant, true),
	}
}
