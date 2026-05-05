package httpapi

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"marketplace-backend/internal/models"
	"marketplace-backend/internal/store"
)

type Server struct {
	store *store.Store
}

const requestTimeout = 5 * time.Second

func New(st *store.Store) *Server {
	return &Server{store: st}
}

func (s *Server) Routes(staticDir string) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/health", s.health)
	mux.HandleFunc("GET /api/products", s.listProducts)
	mux.HandleFunc("GET /api/categories", s.listCategories)
	mux.HandleFunc("GET /api/cart", s.listCart)
	mux.HandleFunc("POST /api/cart", s.addToCart)
	mux.HandleFunc("DELETE /api/cart/{id}", s.removeFromCart)
	mux.HandleFunc("GET /api/purchases", s.listPurchases)
	mux.HandleFunc("POST /api/checkout", s.checkout)
	mux.HandleFunc("GET /api/account", s.getAccount)
	mux.HandleFunc("POST /api/top-up", s.topUp)
	mux.HandleFunc("POST /api/auth/register", s.register)
	mux.HandleFunc("POST /api/auth/login", s.login)
	mux.HandleFunc("GET /api/me", s.me)
	mux.HandleFunc("GET /api/support/messages", s.supportMessages)
	mux.HandleFunc("POST /api/support/messages", s.addSupportMessage)
	mux.HandleFunc("GET /api/conversations", s.conversations)
	mux.HandleFunc("POST /api/conversations", s.startConversation)
	mux.HandleFunc("GET /api/conversations/{id}/messages", s.conversationMessages)
	mux.HandleFunc("POST /api/conversations/{id}/messages", s.addConversationMessage)
	mux.HandleFunc("GET /favicon.ico", s.favicon)
	mux.Handle("/", http.FileServer(http.Dir(staticDir)))

	return cors(mux)
}

func (s *Server) health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) favicon(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) context(r *http.Request, timeout time.Duration) (context.Context, context.CancelFunc) {
	return context.WithTimeout(r.Context(), timeout)
}

func (s *Server) ownerID(ctx context.Context, r *http.Request) string {
	user, err := s.optionalUser(ctx, r)
	if err != nil {
		return store.GuestOwnerID
	}
	return user.ID.Hex()
}

func (s *Server) optionalUser(ctx context.Context, r *http.Request) (models.User, error) {
	token := bearerToken(r)
	if token == "" {
		return models.User{}, errors.New("missing auth token")
	}
	return s.store.UserByToken(ctx, token)
}

func bearerToken(r *http.Request) string {
	header := strings.TrimSpace(r.Header.Get("Authorization"))
	return strings.TrimSpace(strings.TrimPrefix(header, "Bearer "))
}
