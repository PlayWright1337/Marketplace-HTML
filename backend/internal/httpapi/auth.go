package httpapi

import (
	"encoding/json"
	"net/http"

	"marketplace-backend/internal/models"
)

func (s *Server) register(w http.ResponseWriter, r *http.Request) {
	var body models.AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}

	ctx, cancel := s.context(r, requestTimeout)
	defer cancel()

	result, err := s.store.Register(ctx, body.Name, body.Email, body.Password)
	if err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	writeJSON(w, http.StatusCreated, result)
}

func (s *Server) login(w http.ResponseWriter, r *http.Request) {
	var body models.AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}

	ctx, cancel := s.context(r, requestTimeout)
	defer cancel()

	result, err := s.store.Login(ctx, body.Email, body.Password)
	if err != nil {
		writeError(w, http.StatusUnauthorized, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (s *Server) me(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := s.context(r, requestTimeout)
	defer cancel()

	user, err := s.optionalUser(ctx, r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, err)
		return
	}
	writeJSON(w, http.StatusOK, user)
}
