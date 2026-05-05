package httpapi

import (
	"encoding/json"
	"errors"
	"net/http"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func (s *Server) listCart(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := s.context(r, requestTimeout)
	defer cancel()

	items, err := s.store.CartItems(ctx, s.ownerID(ctx, r))
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (s *Server) addToCart(w http.ResponseWriter, r *http.Request) {
	var body struct {
		ProductID string `json:"productId"`
	}
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

	item, err := s.store.AddToCart(ctx, s.ownerID(ctx, r), productID)
	if errors.Is(err, mongo.ErrNoDocuments) {
		writeError(w, http.StatusNotFound, errors.New("product not found"))
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusCreated, item)
}

func (s *Server) removeFromCart(w http.ResponseWriter, r *http.Request) {
	id, err := bson.ObjectIDFromHex(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid cart item id"))
		return
	}

	ctx, cancel := s.context(r, requestTimeout)
	defer cancel()

	if err := s.store.RemoveFromCart(ctx, s.ownerID(ctx, r), id); err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
