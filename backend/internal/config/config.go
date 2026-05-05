package config

import (
	"os"
	"path/filepath"
	"strings"
)

type Config struct {
	MongoURI    string
	Database    string
	Port        string
	StaticDir   string
	TokenPepper string
}

func Load() Config {
	return Config{
		MongoURI:    env("MONGO_URI", "mongodb://localhost:27017"),
		Database:    env("MONGO_DATABASE", "marketplace"),
		Port:        env("PORT", "8080"),
		StaticDir:   staticDir(),
		TokenPepper: env("TOKEN_PEPPER", "dev-token-pepper"),
	}
}

func env(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

func staticDir() string {
	if value := strings.TrimSpace(os.Getenv("STATIC_DIR")); value != "" {
		return absOrValue(value)
	}

	candidates := []string{
		"frontend",
		filepath.Join("..", "frontend"),
		filepath.Join("..", "..", "frontend"),
		filepath.Join("..", "..", "..", "frontend"),
	}
	for _, candidate := range candidates {
		indexPath := filepath.Join(candidate, "index.html")
		if _, err := os.Stat(indexPath); err == nil {
			return absOrValue(candidate)
		}
	}

	return absOrValue(filepath.Join("..", "frontend"))
}

func absOrValue(path string) string {
	absolute, err := filepath.Abs(path)
	if err != nil {
		return path
	}
	return absolute
}
