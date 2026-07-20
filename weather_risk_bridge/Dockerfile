# Home Assistant app image (Supervisor Docker API still uses type=addon)
# https://developers.home-assistant.io/docs/add-ons/configuration#add-on-dockerfile
ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base-python:3.13-alpine3.21
FROM ${BUILD_FROM}

ENV LANG=C.UTF-8

WORKDIR /app

COPY service/pyproject.toml service/README.md ./
COPY service/src ./src

RUN pip3 install --no-cache-dir .

COPY run.sh /
RUN chmod a+x /run.sh

LABEL \
  io.hass.name="Weather Risk Bridge" \
  io.hass.description="NOAA/SPC companion service for Weather Risk Bridge" \
  io.hass.type="addon" \
  io.hass.version="0.1.0" \
  io.hass.arch="amd64|aarch64|armv7"

CMD ["/run.sh"]
