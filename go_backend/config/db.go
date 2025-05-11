package config

import (
	"context"
	"log"
	"os"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client

// ConnectDB establishes a connection to MongoDB
func ConnectDB(ctx context.Context) error {
	uri := os.Getenv("MONGO_URI")
	if uri == "" {
		log.Fatal("MONGO_URI environment variable not set")
	}

	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return err
	}

	// Ping the database to verify connection
	if err := client.Ping(ctx, nil); err != nil {
		return err
	}

	Client = client
	log.Println("Connected to MongoDB")
	return nil
}

// DisconnectDB closes the connection to MongoDB
func DisconnectDB(ctx context.Context) {
	if Client == nil {
		return
	}

	if err := Client.Disconnect(ctx); err != nil {
		log.Printf("Error disconnecting from MongoDB: %v", err)
		return
	}

	log.Println("Disconnected from MongoDB")
}

// GetCollection returns a handle to a MongoDB collection
func GetCollection(collectionName string) *mongo.Collection {
	return Client.Database("streamify_db").Collection(collectionName)
}
