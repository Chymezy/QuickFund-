#!/bin/sh
# wait-for-db.sh

set -e

host="$1"
shift
cmd="$@"

# Use default credentials from docker-compose.yml
export PGPASSWORD=${POSTGRES_PASSWORD:-password}
export PGUSER=${POSTGRES_USER:-postgres}

until psql -h "$host" -U "$PGUSER" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
exec $cmd 