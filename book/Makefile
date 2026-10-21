OUTPUT ?= /tmp/bijou-job-monitor-book
LATEX ?= lualatex

.PHONY: build pdf
build:
	mkdir -p "$(OUTPUT)"
	for pass in 1 2 3; do \
	  $(LATEX) --no-shell-escape --interaction=nonstopmode --halt-on-error \
	    --recorder --output-directory="$(OUTPUT)" bijou-book.tex || exit $$?; \
	done

pdf: build
	cp "$(OUTPUT)/bijou-book.pdf" bijou-book.pdf
