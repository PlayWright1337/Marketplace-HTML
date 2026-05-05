package httpapi

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"marketplace-backend/internal/models"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func (s *Server) conversations(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := s.context(r, requestTimeout)
	defer cancel()

	conversations, err := s.store.Conversations(ctx, s.ownerID(ctx, r))
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, conversations)
}

func (s *Server) startConversation(w http.ResponseWriter, r *http.Request) {
	var body models.StartConversationRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}

	productID, err := bson.ObjectIDFromHex(body.ProductID)
	if err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid productId"))
		return
	}

	ctx, cancel := s.context(r, requestTimeout)
	defer cancel()

	conversation, err := s.store.StartConversation(ctx, s.ownerID(ctx, r), productID)
	if errors.Is(err, mongo.ErrNoDocuments) {
		writeError(w, http.StatusNotFound, errors.New("product not found"))
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusCreated, conversation)
}

func (s *Server) conversationMessages(w http.ResponseWriter, r *http.Request) {
	conversationID, err := bson.ObjectIDFromHex(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid conversation id"))
		return
	}

	ctx, cancel := s.context(r, requestTimeout)
	defer cancel()

	messages, err := s.store.ConversationMessages(ctx, s.ownerID(ctx, r), conversationID)
	if errors.Is(err, mongo.ErrNoDocuments) {
		writeError(w, http.StatusNotFound, errors.New("conversation not found"))
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, messages)
}

func (s *Server) addConversationMessage(w http.ResponseWriter, r *http.Request) {
	conversationID, err := bson.ObjectIDFromHex(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid conversation id"))
		return
	}

	var body models.ConversationMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	body.Body = strings.TrimSpace(body.Body)
	if body.Body == "" {
		writeError(w, http.StatusBadRequest, errors.New("message body is required"))
		return
	}

	ctx, cancel := s.context(r, requestTimeout)
	defer cancel()

	message, err := s.store.AddConversationMessage(ctx, s.ownerID(ctx, r), conversationID, "Вы", body.Body)
	if errors.Is(err, mongo.ErrNoDocuments) {
		writeError(w, http.StatusNotFound, errors.New("conversation not found"))
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}

	_ = s.store.SellerReply(ctx, s.ownerID(ctx, r), conversationID)
	writeJSON(w, http.StatusCreated, message)
}
