#!/usr/bin/with-contenv bashio
# shellcheck shell=bash
set -euo pipefail

export WEATHER_RISK_BRIDGE_HOST="0.0.0.0"
export WEATHER_RISK_BRIDGE_PORT="$(bashio::config 'port')"
export WEATHER_RISK_BRIDGE_USER_AGENT="$(bashio::config 'user_agent')"

if bashio::config.has_value 'token'; then
  export WEATHER_RISK_BRIDGE_TOKEN="$(bashio::config 'token')"
else
  unset WEATHER_RISK_BRIDGE_TOKEN || true
fi

bashio::log.info "Starting Weather Risk Bridge on port ${WEATHER_RISK_BRIDGE_PORT}"
exec weather-risk-bridge
