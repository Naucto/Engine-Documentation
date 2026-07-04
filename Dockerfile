FROM python:3.12-slim AS builder
WORKDIR /docs

COPY docs/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY docs/ .
RUN sphinx-build -b html . _build/html

FROM builder AS dev
RUN pip install --no-cache-dir sphinx-autobuild
EXPOSE 8080
CMD ["sphinx-autobuild", "-b", "html", "--host", "0.0.0.0", "--port", "8080", ".", "_build/html"]

FROM nginx:alpine
COPY --from=builder /docs/_build/html /usr/share/nginx/html
EXPOSE 80
