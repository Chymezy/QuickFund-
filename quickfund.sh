#!/bin/bash

case "$1" in
  start)
    docker-compose up -d
    ;;
  stop)
    docker-compose down
    ;;
  restart)
    docker-compose down
    docker-compose up -d
    ;;
  status)
    docker-compose ps
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status}"
    exit 1
esac