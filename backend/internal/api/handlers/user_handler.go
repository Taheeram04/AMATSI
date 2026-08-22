package handlers

import (
	"log/slog"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kijanifarmer/backend/internal/api/middleware"
	"github.com/kijanifarmer/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

func UpdateProfileHandler(c *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var input struct {
		FullName   string `json:"full_name" binding:"required"`
		Email      string `json:"email"`
		Language   string `json:"language" binding:"required,oneof=en sw luo"`
		SMSEnabled *bool  `json:"sms_enabled" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	smsEnabled := true
	if input.SMSEnabled != nil {
		smsEnabled = *input.SMSEnabled
	}

	db := c.MustGet("db_pool").(*pgxpool.Pool)
	repo := repository.NewUserRepository(db)
	user, err := repo.UpdateProfile(c.Request.Context(), userID,
		strings.TrimSpace(input.FullName),
		strings.TrimSpace(input.Email),
		input.Language,
		smsEnabled,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
			return
		}
		slog.Error("profile update failed", slog.String("user_id", userID), slog.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update profile"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func ChangePasswordHandler(c *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var input struct {
		CurrentPassword string `json:"current_password" binding:"required"`
		NewPassword     string `json:"new_password" binding:"required,min=8"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := c.MustGet("db_pool").(*pgxpool.Pool)
	repo := repository.NewUserRepository(db)
	user, err := repo.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	if user.PasswordHash != "" {
		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.CurrentPassword)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "current password is incorrect"})
			return
		}
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}
	if err := repo.UpdatePasswordHash(c.Request.Context(), userID, string(hash)); err != nil {
		slog.Error("password update failed", slog.String("user_id", userID), slog.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update password"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "password_updated"})
}

func GetMeHandler(c *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	db := c.MustGet("db_pool").(*pgxpool.Pool)
	repo := repository.NewUserRepository(db)
	user, err := repo.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}
