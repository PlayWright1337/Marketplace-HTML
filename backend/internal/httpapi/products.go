package httpapi

import (
	"net/http"
)

func (s *Server) listProducts(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := s.context(r, requestTimeout)
	defer cancel()

	products, err := s.store.Products(ctx, r.URL.Query().Get("category"), r.URL.Query().Get("q"))
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, products)
}

func (s *Server) listCategories(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := s.context(r, requestTimeout)
	defer cancel()

	categories, err := s.store.Categories(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, categories)
}
