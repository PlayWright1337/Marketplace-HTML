package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"marketplace-backend/internal/config"
	"marketplace-backend/internal/httpapi"
	"marketplace-backend/internal/store"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func main() {
	cfg := config.Load()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(options.Client().ApplyURI(cfg.MongoURI))
	if err != nil {
		log.Fatalf("connect mongo: %v", err)
	}
	defer func() {
		_ = client.Disconnect(context.Background())
	}()

	if err := client.Ping(ctx, nil); err != nil {
		log.Fatalf("ping mongo: %v", err)
	}

	st := store.New(client.Database(cfg.Database))
	if err := st.Seed(ctx); err != nil {
		log.Fatalf("seed database: %v", err)
	}

	api := httpapi.New(st)
	addr := ":" + cfg.Port
	log.Printf("marketplace backend listening on http://localhost%s", addr)
	log.Printf("serving frontend from %s", cfg.StaticDir)
	if err := http.ListenAndServe(addr, api.Routes(cfg.StaticDir)); err != nil {
		log.Fatal(err)
	}
}
