#!/bin/bash

# Build the Docker image
docker build -f Dockerfile-local -t dnd-tracker-local .

# Run the Docker container
docker run --rm -p 3000:3000 --env-file .env.local dnd-tracker-local
