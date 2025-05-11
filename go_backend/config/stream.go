package config

import (
	"os"

	stream "github.com/GetStream/stream-chat-go/v6"
)

var StreamClient *stream.Client

// InitStreamClient initializes the Stream Chat client
func InitStreamClient() error {
	apiKey := os.Getenv("STREAM_API_KEY")
	apiSecret := os.Getenv("STREAM_API_SECRET")

	if apiKey == "" || apiSecret == "" {
		return Error("Stream API Key or Secret is missing in environment variables")
	}

	client, err := stream.NewClient(apiKey, apiSecret)
	if err != nil {
		return err
	}

	StreamClient = client
	return nil
}

// Error represents a custom error
type Error string

func (e Error) Error() string {
	return string(e)
}
