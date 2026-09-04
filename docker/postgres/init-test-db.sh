#!/bin/sh
# Creates the database used by `make test-integration`. Runs once, when the
# Postgres volume is first initialised.
set -e
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE homedetailing_test OWNER $POSTGRES_USER;"
