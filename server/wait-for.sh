#!/bin/sh

set -e

host="$1"
shift
cmd="$@"

echo "Waiting for $host to be ready..."

until pg_isready -h "$host" -p 5432 > /dev/null 2>&1; do
  echo "Waiting for PostgreSQL at $host:5432..."
  sleep 2
done

echo "PostgreSQL is ready. Running command: $cmd"
exec $cmd
