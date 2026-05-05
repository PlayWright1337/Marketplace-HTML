package store

import (
	"context"
	"errors"
	"strings"
	"time"

	"marketplace-backend/internal/models"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const GuestOwnerID = "guest"

var ErrNotEnoughBalance = errors.New("not enough balance")
var ErrEmptyCart = errors.New("cart is empty")

type Store struct {
	products  *mongo.Collection
	cart      *mongo.Collection
	purchases *mongo.Collection
	accounts  *mongo.Collection
	users     *mongo.Collection
	sessions  *mongo.Collection
	support   *mongo.Collection
	dialogs   *mongo.Collection
	messages  *mongo.Collection
}

func New(db *mongo.Database) *Store {
	return &Store{
		products:  db.Collection("products"),
		cart:      db.Collection("cart"),
		purchases: db.Collection("purchases"),
		accounts:  db.Collection("accounts"),
		users:     db.Collection("users"),
		sessions:  db.Collection("sessions"),
		support:   db.Collection("support_messages"),
		dialogs:   db.Collection("conversations"),
		messages:  db.Collection("conversation_messages"),
	}
}

func (s *Store) EnsureIndexes(ctx context.Context) error {
	indexes := []struct {
		collection *mongo.Collection
		model      mongo.IndexModel
	}{
		{s.users, mongo.IndexModel{Keys: bson.M{"email": 1}, Options: options.Index().SetUnique(true)}},
		{s.sessions, mongo.IndexModel{Keys: bson.M{"token": 1}, Options: options.Index().SetUnique(true)}},
		{s.cart, mongo.IndexModel{Keys: bson.D{{Key: "ownerId", Value: 1}, {Key: "productId", Value: 1}}, Options: options.Index().SetUnique(true)}},
		{s.dialogs, mongo.IndexModel{Keys: bson.D{{Key: "ownerId", Value: 1}, {Key: "productId", Value: 1}}, Options: options.Index().SetUnique(true)}},
	}

	for _, index := range indexes {
		if _, err := index.collection.Indexes().CreateOne(ctx, index.model); err != nil {
			return err
		}
	}
	return nil
}

func (s *Store) Seed(ctx context.Context) error {
	if err := s.EnsureIndexes(ctx); err != nil {
		return err
	}

	products := []models.Product{
		{Name: "Premium UI Kit", Category: "design", Label: "Дизайн", Price: 45, Image: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&h=420&fit=crop", Rating: 4.9, Seller: "North Studio"},
		{Name: "SaaS Dashboard", Category: "code", Label: "Код", Price: 120, Image: "https://images.unsplash.com/photo-1551288049-bbbda536ad3a?w=600&h=420&fit=crop", Rating: 4.8, Seller: "Flowkit"},
		{Name: "Mobile App Icons", Category: "icons", Label: "Иконки", Price: 15, Image: "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=600&h=420&fit=crop", Rating: 4.7, Seller: "Glyph Lab"},
		{Name: "React Template", Category: "code", Label: "Код", Price: 89, Image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=420&fit=crop", Rating: 4.9, Seller: "Pixel Forge"},
		{Name: "Brand Identity", Category: "design", Label: "Дизайн", Price: 200, Image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=420&fit=crop", Rating: 5.0, Seller: "Mono Mark"},
		{Name: "3D Character", Category: "3d", Label: "3D", Price: 60, Image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&h=420&fit=crop", Rating: 4.6, Seller: "Renderbox"},
	}

	for _, item := range products {
		_, err := s.products.UpdateOne(
			ctx,
			bson.M{"name": item.Name},
			bson.M{"$set": item},
			options.UpdateOne().SetUpsert(true),
		)
		if err != nil {
			return err
		}
	}

	return s.EnsureAccount(ctx, GuestOwnerID, 1250)
}

func (s *Store) Products(ctx context.Context, category string, query string) ([]models.Product, error) {
	filter := bson.M{}
	if category != "" && category != "all" {
		filter["category"] = category
	}
	if query = strings.TrimSpace(query); query != "" {
		filter["name"] = bson.M{"$regex": query, "$options": "i"}
	}

	cursor, err := s.products.Find(ctx, filter, options.Find().SetSort(bson.M{"name": 1}))
	if err != nil {
		return []models.Product{}, err
	}
	defer cursor.Close(ctx)

	products := []models.Product{}
	if err := cursor.All(ctx, &products); err != nil {
		return []models.Product{}, err
	}
	return products, nil
}

func (s *Store) Categories(ctx context.Context) ([]models.Category, error) {
	products, err := s.Products(ctx, "", "")
	if err != nil {
		return []models.Category{}, err
	}

	labels := map[string]string{}
	counts := map[string]int{}
	for _, product := range products {
		labels[product.Category] = product.Label
		counts[product.Category]++
	}

	categories := []models.Category{{ID: "all", Label: "Все", Count: len(products)}}
	order := []string{"design", "code", "icons", "3d"}
	for _, id := range order {
		if counts[id] > 0 {
			categories = append(categories, models.Category{ID: id, Label: labels[id], Count: counts[id]})
		}
	}
	return categories, nil
}

func (s *Store) EnsureAccount(ctx context.Context, ownerID string, balance float64) error {
	_, err := s.accounts.UpdateOne(
		ctx,
		bson.M{"_id": ownerID},
		bson.M{"$setOnInsert": models.Account{ID: ownerID, Balance: balance, UpdatedAt: time.Now()}},
		options.UpdateOne().SetUpsert(true),
	)
	return err
}

func (s *Store) Account(ctx context.Context, ownerID string) (models.Account, error) {
	if err := s.EnsureAccount(ctx, ownerID, 0); err != nil {
		return models.Account{}, err
	}

	var account models.Account
	err := s.accounts.FindOne(ctx, bson.M{"_id": ownerID}).Decode(&account)
	return account, err
}

func (s *Store) TopUp(ctx context.Context, ownerID string, amount float64) (models.Account, error) {
	if err := s.EnsureAccount(ctx, ownerID, 0); err != nil {
		return models.Account{}, err
	}

	result := s.accounts.FindOneAndUpdate(
		ctx,
		bson.M{"_id": ownerID},
		bson.M{"$inc": bson.M{"balance": amount}, "$set": bson.M{"updatedAt": time.Now()}},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	)

	var account models.Account
	return account, result.Decode(&account)
}

func (s *Store) CartItems(ctx context.Context, ownerID string) ([]models.CartItem, error) {
	cursor, err := s.cart.Find(ctx, bson.M{"ownerId": ownerID}, options.Find().SetSort(bson.M{"addedAt": -1}))
	if err != nil {
		return []models.CartItem{}, err
	}
	defer cursor.Close(ctx)

	items := []models.CartItem{}
	if err := cursor.All(ctx, &items); err != nil {
		return []models.CartItem{}, err
	}

	for i := range items {
		var found models.Product
		if err := s.products.FindOne(ctx, bson.M{"_id": items[i].ProductID}).Decode(&found); err == nil {
			items[i].Product = &found
		}
	}
	return items, nil
}

func (s *Store) AddToCart(ctx context.Context, ownerID string, productID bson.ObjectID) (models.CartItem, error) {
	var found models.Product
	if err := s.products.FindOne(ctx, bson.M{"_id": productID}).Decode(&found); err != nil {
		return models.CartItem{}, err
	}

	var existing models.CartItem
	err := s.cart.FindOne(ctx, bson.M{"ownerId": ownerID, "productId": productID}).Decode(&existing)
	if err == nil {
		existing.Product = &found
		return existing, nil
	}
	if !errors.Is(err, mongo.ErrNoDocuments) {
		return models.CartItem{}, err
	}

	item := models.CartItem{OwnerID: ownerID, ProductID: productID, AddedAt: time.Now()}
	result, err := s.cart.InsertOne(ctx, item)
	if err != nil {
		return models.CartItem{}, err
	}

	item.ID = result.InsertedID.(bson.ObjectID)
	item.Product = &found
	return item, nil
}

func (s *Store) RemoveFromCart(ctx context.Context, ownerID string, cartID bson.ObjectID) error {
	_, err := s.cart.DeleteOne(ctx, bson.M{"_id": cartID, "ownerId": ownerID})
	return err
}

func (s *Store) Purchases(ctx context.Context, ownerID string) ([]models.Purchase, error) {
	cursor, err := s.purchases.Find(ctx, bson.M{"ownerId": ownerID}, options.Find().SetSort(bson.M{"createdAt": -1}))
	if err != nil {
		return []models.Purchase{}, err
	}
	defer cursor.Close(ctx)

	purchases := []models.Purchase{}
	if err := cursor.All(ctx, &purchases); err != nil {
		return []models.Purchase{}, err
	}

	for i := range purchases {
		var found models.Product
		if err := s.products.FindOne(ctx, bson.M{"_id": purchases[i].ProductID}).Decode(&found); err == nil {
			purchases[i].Product = &found
		}
	}
	return purchases, nil
}

func (s *Store) Checkout(ctx context.Context, ownerID string) (models.CheckoutResponse, error) {
	items, err := s.CartItems(ctx, ownerID)
	if err != nil {
		return models.CheckoutResponse{}, err
	}
	if len(items) == 0 {
		return models.CheckoutResponse{}, ErrEmptyCart
	}

	total := 0.0
	for _, item := range items {
		if item.Product != nil {
			total += item.Product.Price
		}
	}

	account, err := s.Account(ctx, ownerID)
	if err != nil {
		return models.CheckoutResponse{}, err
	}
	if account.Balance < total {
		return models.CheckoutResponse{}, ErrNotEnoughBalance
	}

	now := time.Now()
	result := s.accounts.FindOneAndUpdate(
		ctx,
		bson.M{"_id": ownerID, "balance": bson.M{"$gte": total}},
		bson.M{"$inc": bson.M{"balance": -total}, "$set": bson.M{"updatedAt": now}},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	)

	var updated models.Account
	if err := result.Decode(&updated); err != nil {
		return models.CheckoutResponse{}, ErrNotEnoughBalance
	}

	docs := make([]any, 0, len(items))
	for _, item := range items {
		if item.Product != nil {
			docs = append(docs, models.Purchase{OwnerID: ownerID, ProductID: item.ProductID, Price: item.Product.Price, CreatedAt: now})
		}
	}
	if len(docs) > 0 {
		if _, err := s.purchases.InsertMany(ctx, docs); err != nil {
			return models.CheckoutResponse{}, err
		}
	}

	if _, err := s.cart.DeleteMany(ctx, bson.M{"ownerId": ownerID}); err != nil {
		return models.CheckoutResponse{}, err
	}

	purchases, err := s.Purchases(ctx, ownerID)
	return models.CheckoutResponse{Account: updated, Purchases: purchases}, err
}

func (s *Store) SupportMessages(ctx context.Context, ownerID string) ([]models.SupportMessage, error) {
	cursor, err := s.support.Find(ctx, bson.M{"ownerId": ownerID}, options.Find().SetSort(bson.M{"createdAt": 1}))
	if err != nil {
		return []models.SupportMessage{}, err
	}
	defer cursor.Close(ctx)

	messages := []models.SupportMessage{}
	if err := cursor.All(ctx, &messages); err != nil {
		return []models.SupportMessage{}, err
	}
	return messages, nil
}

func (s *Store) AddSupportMessage(ctx context.Context, ownerID string, author string, body string) (models.SupportMessage, error) {
	message := models.SupportMessage{OwnerID: ownerID, Author: author, Body: body, CreatedAt: time.Now()}
	result, err := s.support.InsertOne(ctx, message)
	if err != nil {
		return models.SupportMessage{}, err
	}
	message.ID = result.InsertedID.(bson.ObjectID)
	return message, nil
}

func (s *Store) Conversations(ctx context.Context, ownerID string) ([]models.Conversation, error) {
	cursor, err := s.dialogs.Find(ctx, bson.M{"ownerId": ownerID}, options.Find().SetSort(bson.M{"updatedAt": -1}))
	if err != nil {
		return []models.Conversation{}, err
	}
	defer cursor.Close(ctx)

	conversations := []models.Conversation{}
	if err := cursor.All(ctx, &conversations); err != nil {
		return []models.Conversation{}, err
	}

	for i := range conversations {
		var product models.Product
		if err := s.products.FindOne(ctx, bson.M{"_id": conversations[i].ProductID}).Decode(&product); err == nil {
			conversations[i].Product = &product
		}

		var last models.ConversationMessage
		err := s.messages.FindOne(
			ctx,
			bson.M{"conversationId": conversations[i].ID, "ownerId": ownerID},
			options.FindOne().SetSort(bson.M{"createdAt": -1}),
		).Decode(&last)
		if err == nil {
			conversations[i].LastBody = last.Body
		}
	}
	return conversations, nil
}

func (s *Store) StartConversation(ctx context.Context, ownerID string, productID bson.ObjectID) (models.Conversation, error) {
	var product models.Product
	if err := s.products.FindOne(ctx, bson.M{"_id": productID}).Decode(&product); err != nil {
		return models.Conversation{}, err
	}

	now := time.Now()
	conversation := models.Conversation{
		OwnerID:   ownerID,
		ProductID: productID,
		Seller:    product.Seller,
		CreatedAt: now,
		UpdatedAt: now,
	}

	result := s.dialogs.FindOneAndUpdate(
		ctx,
		bson.M{"ownerId": ownerID, "productId": productID},
		bson.M{
			"$setOnInsert": conversation,
			"$set":         bson.M{"updatedAt": now},
		},
		options.FindOneAndUpdate().SetUpsert(true).SetReturnDocument(options.After),
	)

	var saved models.Conversation
	if err := result.Decode(&saved); err != nil {
		return models.Conversation{}, err
	}
	saved.Product = &product

	count, err := s.messages.CountDocuments(ctx, bson.M{"conversationId": saved.ID, "ownerId": ownerID})
	if err != nil {
		return models.Conversation{}, err
	}
	if count == 0 {
		_, err = s.AddConversationMessage(ctx, ownerID, saved.ID, saved.Seller, "Здравствуйте! Я продавец этого товара. Задайте вопрос по покупке, лицензии или составу продукта.")
		if err != nil {
			return models.Conversation{}, err
		}
	}

	return saved, nil
}

func (s *Store) ConversationMessages(ctx context.Context, ownerID string, conversationID bson.ObjectID) ([]models.ConversationMessage, error) {
	if err := s.ensureConversationOwner(ctx, ownerID, conversationID); err != nil {
		return []models.ConversationMessage{}, err
	}

	cursor, err := s.messages.Find(
		ctx,
		bson.M{"conversationId": conversationID, "ownerId": ownerID},
		options.Find().SetSort(bson.M{"createdAt": 1}),
	)
	if err != nil {
		return []models.ConversationMessage{}, err
	}
	defer cursor.Close(ctx)

	messages := []models.ConversationMessage{}
	if err := cursor.All(ctx, &messages); err != nil {
		return []models.ConversationMessage{}, err
	}
	return messages, nil
}

func (s *Store) AddConversationMessage(ctx context.Context, ownerID string, conversationID bson.ObjectID, author string, body string) (models.ConversationMessage, error) {
	if err := s.ensureConversationOwner(ctx, ownerID, conversationID); err != nil {
		return models.ConversationMessage{}, err
	}

	now := time.Now()
	message := models.ConversationMessage{
		ConversationID: conversationID,
		OwnerID:        ownerID,
		Author:         author,
		Body:           body,
		CreatedAt:      now,
	}
	result, err := s.messages.InsertOne(ctx, message)
	if err != nil {
		return models.ConversationMessage{}, err
	}
	message.ID = result.InsertedID.(bson.ObjectID)

	_, err = s.dialogs.UpdateOne(ctx, bson.M{"_id": conversationID, "ownerId": ownerID}, bson.M{"$set": bson.M{"updatedAt": now}})
	if err != nil {
		return models.ConversationMessage{}, err
	}
	return message, nil
}

func (s *Store) SellerReply(ctx context.Context, ownerID string, conversationID bson.ObjectID) error {
	var conversation models.Conversation
	if err := s.dialogs.FindOne(ctx, bson.M{"_id": conversationID, "ownerId": ownerID}).Decode(&conversation); err != nil {
		return err
	}

	_, err := s.AddConversationMessage(ctx, ownerID, conversationID, conversation.Seller, "Спасибо за вопрос. Я уточню детали и помогу с покупкой.")
	return err
}

func (s *Store) ensureConversationOwner(ctx context.Context, ownerID string, conversationID bson.ObjectID) error {
	count, err := s.dialogs.CountDocuments(ctx, bson.M{"_id": conversationID, "ownerId": ownerID})
	if err != nil {
		return err
	}
	if count == 0 {
		return mongo.ErrNoDocuments
	}
	return nil
}
