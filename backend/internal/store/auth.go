package store

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"strings"
	"time"

	"marketplace-backend/internal/models"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"golang.org/x/crypto/bcrypt"
)

var ErrInvalidCredentials = errors.New("invalid email or password")

func (s *Store) Register(ctx context.Context, name string, email string, password string) (models.AuthResponse, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	name = strings.TrimSpace(name)
	if name == "" || email == "" || len(password) < 6 {
		return models.AuthResponse{}, errors.New("name, valid email and password with 6+ chars are required")
	}

	passwordHash, err := hashPassword(password)
	if err != nil {
		return models.AuthResponse{}, err
	}

	newUser := models.User{Name: name, Email: email, PasswordHash: passwordHash, CreatedAt: time.Now()}
	result, err := s.users.InsertOne(ctx, newUser)
	if err != nil {
		return models.AuthResponse{}, errors.New("email is already registered")
	}
	newUser.ID = result.InsertedID.(bson.ObjectID)

	if err := s.EnsureAccount(ctx, newUser.ID.Hex(), 0); err != nil {
		return models.AuthResponse{}, err
	}

	token, err := s.createSession(ctx, newUser.ID)
	if err != nil {
		return models.AuthResponse{}, err
	}
	return models.AuthResponse{Token: token, User: newUser}, nil
}

func (s *Store) Login(ctx context.Context, email string, password string) (models.AuthResponse, error) {
	var found models.User
	err := s.users.FindOne(ctx, bson.M{"email": strings.ToLower(strings.TrimSpace(email))}).Decode(&found)
	if err != nil || !checkPassword(found.PasswordHash, password) {
		return models.AuthResponse{}, ErrInvalidCredentials
	}

	token, err := s.createSession(ctx, found.ID)
	if err != nil {
		return models.AuthResponse{}, err
	}
	return models.AuthResponse{Token: token, User: found}, nil
}

func (s *Store) UserByToken(ctx context.Context, rawToken string) (models.User, error) {
	token := hashToken(strings.TrimSpace(rawToken))
	if token == "" {
		return models.User{}, errors.New("missing auth token")
	}

	var sess models.Session
	if err := s.sessions.FindOne(ctx, bson.M{"token": token}).Decode(&sess); err != nil {
		return models.User{}, errors.New("invalid auth token")
	}

	var found models.User
	if err := s.users.FindOne(ctx, bson.M{"_id": sess.UserID}).Decode(&found); err != nil {
		return models.User{}, errors.New("user not found")
	}
	return found, nil
}

func (s *Store) createSession(ctx context.Context, userID bson.ObjectID) (string, error) {
	rawToken, err := randomToken()
	if err != nil {
		return "", err
	}

	_, err = s.sessions.InsertOne(ctx, models.Session{UserID: userID, Token: hashToken(rawToken), CreatedAt: time.Now()})
	if err != nil {
		return "", err
	}
	return rawToken, nil
}

func hashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(hash), err
}

func checkPassword(hash string, password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

func hashToken(token string) string {
	if token == "" {
		return ""
	}
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

func randomToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func IsDuplicateKey(err error) bool {
	return mongo.IsDuplicateKeyError(err)
}
