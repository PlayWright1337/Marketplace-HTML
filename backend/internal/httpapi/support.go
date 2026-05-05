package httpapi

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"marketplace-backend/internal/models"
)

func (s *Server) supportMessages(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := s.context(r, requestTimeout)
	defer cancel()

	messages, err := s.store.SupportMessages(ctx, s.ownerID(ctx, r))
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, messages)
}

func (s *Server) addSupportMessage(w http.ResponseWriter, r *http.Request) {
	var body models.SupportMessageRequest
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

	ownerID := s.ownerID(ctx, r)
	message, err := s.store.AddSupportMessage(ctx, ownerID, "Вы", body.Body)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}

	if _, err := s.store.AddSupportMessage(ctx, ownerID, "Поддержка", "Спасибо, мы получили сообщение и скоро ответим."); err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}

	writeJSON(w, http.StatusCreated, message)
}
