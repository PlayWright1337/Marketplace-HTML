package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Product struct {
	ID       bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Name     string        `bson:"name" json:"name"`
	Category string        `bson:"category" json:"category"`
	Label    string        `bson:"label" json:"label"`
	Price    float64       `bson:"price" json:"price"`
	Image    string        `bson:"image" json:"image"`
	Rating   float64       `bson:"rating" json:"rating"`
	Seller   string        `bson:"seller" json:"seller"`
}

type Category struct {
	ID    string `json:"id"`
	Label string `json:"label"`
	Count int    `json:"count"`
}

type CartItem struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	OwnerID   string        `bson:"ownerId" json:"ownerId"`
	ProductID bson.ObjectID `bson:"productId" json:"productId"`
	AddedAt   time.Time     `bson:"addedAt" json:"addedAt"`
	Product   *Product      `bson:"-" json:"product,omitempty"`
}

type Purchase struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	OwnerID   string        `bson:"ownerId" json:"ownerId"`
	ProductID bson.ObjectID `bson:"productId" json:"productId"`
	Price     float64       `bson:"price" json:"price"`
	CreatedAt time.Time     `bson:"createdAt" json:"createdAt"`
	Product   *Product      `bson:"-" json:"product,omitempty"`
}

type Account struct {
	ID        string    `bson:"_id" json:"id"`
	Balance   float64   `bson:"balance" json:"balance"`
	UpdatedAt time.Time `bson:"updatedAt" json:"updatedAt"`
}

type User struct {
	ID           bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Name         string        `bson:"name" json:"name"`
	Email        string        `bson:"email" json:"email"`
	PasswordHash string        `bson:"passwordHash" json:"-"`
	CreatedAt    time.Time     `bson:"createdAt" json:"createdAt"`
}

type Session struct {
	ID        bson.ObjectID `bson:"_id,omitempty"`
	UserID    bson.ObjectID `bson:"userId"`
	Token     string        `bson:"token"`
	CreatedAt time.Time     `bson:"createdAt"`
}

type SupportMessage struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	OwnerID   string        `bson:"ownerId" json:"ownerId"`
	Author    string        `bson:"author" json:"author"`
	Body      string        `bson:"body" json:"body"`
	CreatedAt time.Time     `bson:"createdAt" json:"createdAt"`
}

type Conversation struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	OwnerID   string        `bson:"ownerId" json:"ownerId"`
	ProductID bson.ObjectID `bson:"productId" json:"productId"`
	Seller    string        `bson:"seller" json:"seller"`
	CreatedAt time.Time     `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time     `bson:"updatedAt" json:"updatedAt"`
	Product   *Product      `bson:"-" json:"product,omitempty"`
	LastBody  string        `bson:"-" json:"lastBody,omitempty"`
}

type ConversationMessage struct {
	ID             bson.ObjectID `bson:"_id,omitempty" json:"id"`
	ConversationID bson.ObjectID `bson:"conversationId" json:"conversationId"`
	OwnerID        string        `bson:"ownerId" json:"ownerId"`
	Author         string        `bson:"author" json:"author"`
	Body           string        `bson:"body" json:"body"`
	CreatedAt      time.Time     `bson:"createdAt" json:"createdAt"`
}

type TopUpRequest struct {
	Amount float64 `json:"amount"`
	Method string  `json:"method"`
}

type CheckoutResponse struct {
	Account   Account    `json:"account"`
	Purchases []Purchase `json:"purchases"`
}

type AuthRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type SupportMessageRequest struct {
	Body string `json:"body"`
}

type StartConversationRequest struct {
	ProductID string `json:"productId"`
}

type ConversationMessageRequest struct {
	Body string `json:"body"`
}
