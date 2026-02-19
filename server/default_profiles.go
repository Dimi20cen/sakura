package server

import "strings"

type defaultProfile struct {
	ID       string
	Username string
}

var defaultProfiles = []defaultProfile{
	{ID: "profile-jethro7194", Username: "Jethro7194"},
	{ID: "profile-kopstiklapsa", Username: "KopsTiKlapsa"},
	{ID: "profile-staxtoputa", Username: "staxtoPUTA"},
	{ID: "profile-giorgaros", Username: "Giorgaros"},
}

func getDefaultProfile(index int64) defaultProfile {
	if len(defaultProfiles) == 0 {
		return defaultProfile{}
	}
	return defaultProfiles[index%int64(len(defaultProfiles))]
}

func getDefaultProfileByUsername(username string) (defaultProfile, bool) {
	for _, profile := range defaultProfiles {
		if strings.EqualFold(profile.Username, username) {
			return profile, true
		}
	}
	return defaultProfile{}, false
}
