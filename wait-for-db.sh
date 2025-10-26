#!/bin/sh
# wait-for-db.sh

set -e

host="$1"
shift
cmd="$@"

until pg_isready -h "$host" -U "$POSTGRES_USER"; do
  echo "Waiting for database at $host..."
  sleep 2
done

exec $cmd
