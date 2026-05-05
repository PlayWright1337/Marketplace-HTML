package httpapi

import (
	"encoding/json"
	"errors"
	"net/http"

	"marketplace-backend/internal/models"
	"marketplace-backend/internal/store"
)

func (s *Server) listPurchases(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := s.context(r, requestTimeout)
	defer cancel()

	purchases, err := s.store.Purchases(ctx, s.ownerID(ctx, r))
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, purchases)
}

func (s *Server) checkout(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := s.context(r, requestTimeout)
	defer cancel()

	result, err := s.store.Checkout(ctx, s.ownerID(ctx, r))
	if errors.Is(err, store.ErrEmptyCart) {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	if errors.Is(err, store.ErrNotEnoughBalance) {
		writeError(w, http.StatusPaymentRequired, err)
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (s *Server) getAccount(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := s.context(r, requestTimeout)
	defer cancel()

	account, err := s.store.Account(ctx, s.ownerID(ctx, r))
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, account)
}

func (s *Server) topUp(w http.ResponseWriter, r *http.Request) {
	var body models.TopUpRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	if body.Amount <= 0 {
		writeError(w, http.StatusBadRequest, errors.New("amount must be positive"))
		return
	}

	ctx, cancel := s.context(r, requestTimeout)
	defer cancel()

	account, err := s.store.TopUp(ctx, s.ownerID(ctx, r), body.Amount)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, account)
}
