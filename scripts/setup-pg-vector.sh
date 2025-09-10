#!/bin/bash

set -e

echo "🔍 Checking for Homebrew..."
if ! command -v brew &> /dev/null; then
  echo "❌ Homebrew is not installed. Please install it first: https://brew.sh/"
  exit 1
fi

echo "📦 Installing PostgreSQL (latest supported by Homebrew)..."
brew install postgresql

echo "🔁 Starting PostgreSQL..."
brew services restart postgresql

echo "📂 Detecting PostgreSQL data directory..."
PGDATA=$(brew --prefix)/var/postgresql
if [ ! -d "$PGDATA/base" ]; then
  echo "🧱 Initializing data directory..."
  initdb "$PGDATA"
fi

echo "🍺 Installing pgvector..."
brew install pgvector

echo "🔗 Linking pgvector extension files..."
PGVECTOR_DIR=$(brew --prefix pgvector)/share/postgresql
PG_EXT_DIR=$(brew --prefix postgresql)/share/postgresql/extension

mkdir -p "$PG_EXT_DIR"
cp -v "$PGVECTOR_DIR/extension/"* "$PG_EXT_DIR/"

echo "⏳ Restarting PostgreSQL to register pgvector..."
pg_ctl -D "$PGDATA" restart

echo "🧠 Creating 'axon' database and enabling pgvector..."
psql -U $(whoami) -d postgres -c "CREATE DATABASE axon;" || echo "Database already exists."
psql -U $(whoami) -d axon -c "CREATE EXTENSION IF NOT EXISTS vector;"

echo "✅ PostgreSQL + pgvector setup complete!"
