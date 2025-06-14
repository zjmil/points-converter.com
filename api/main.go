package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// ConversionData represents the structure of our conversions.json file
type ConversionData struct {
	LastUpdated string                 `json:"lastUpdated"`
	DataSource  string                 `json:"dataSource"`
	Config      map[string]interface{} `json:"config"`
	Programs    map[string]interface{} `json:"programs"`
	Conversions []interface{}          `json:"conversions"`
}

var conversionData *ConversionData

func main() {
	// Load conversion data at startup
	if err := loadConversionData(); err != nil {
		log.Fatalf("Failed to load conversion data: %v", err)
	}

	// Create Gin router
	r := gin.Default()

	// Set trusted proxies (empty for security - no proxies trusted)
	r.SetTrustedProxies(nil)

	// Add CORS middleware
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{
		"https://points-converter.com",     // Production frontend
		"http://localhost:5173",            // Vite dev server
		"http://localhost:4173",            // Vite preview server
	}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))

	// API routes
	api := r.Group("/api/v1")
	{
		api.GET("/conversions", getConversions)
		api.GET("/health", getHealth)
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting API server on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func loadConversionData() error {
	// Look for conversions.json in current directory (Docker) or relative path (local dev)
	dataPath := "conversions.json"
	if _, err := os.Stat(dataPath); os.IsNotExist(err) {
		dataPath = filepath.Join("..", "public", "data", "conversions.json")
	}
	
	// Read the JSON file
	data, err := os.ReadFile(dataPath)
	if err != nil {
		return err
	}

	// Parse JSON into our struct
	conversionData = &ConversionData{}
	if err := json.Unmarshal(data, conversionData); err != nil {
		return err
	}

	log.Printf("Loaded conversion data: %d programs, %d conversions", 
		len(conversionData.Programs), len(conversionData.Conversions))
	
	return nil
}

func getConversions(c *gin.Context) {
	if conversionData == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Conversion data not loaded",
		})
		return
	}

	c.JSON(http.StatusOK, conversionData)
}

func getHealth(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "healthy",
		"message": "Points Converter API is running",
	})
}