from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from aiohttp import ClientError
from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import WeatherRiskBridgeClient
from .const import (
    CONF_BEARER_TOKEN,
    CONF_LABEL,
    CONF_LATITUDE,
    CONF_LONGITUDE,
    CONF_SERVICE_URL,
    CONF_WIND_THRESHOLD_MPH,
    DEFAULT_SERVICE_URL,
    DEFAULT_WIND_THRESHOLD_MPH,
    DOMAIN,
)
from .helpers import entry_title_from_config, merge_entry_config

LOGGER = logging.getLogger(__name__)


def _build_schema(defaults: dict[str, Any]) -> vol.Schema:
    return vol.Schema(
        {
            vol.Required(CONF_SERVICE_URL, default=defaults[CONF_SERVICE_URL]): str,
            vol.Optional(CONF_BEARER_TOKEN, default=defaults.get(CONF_BEARER_TOKEN, "")): str,
            vol.Optional(CONF_LABEL, default=defaults.get(CONF_LABEL, "")): str,
            vol.Required(CONF_LATITUDE, default=defaults[CONF_LATITUDE]): vol.Coerce(float),
            vol.Required(CONF_LONGITUDE, default=defaults[CONF_LONGITUDE]): vol.Coerce(float),
            vol.Required(
                CONF_WIND_THRESHOLD_MPH,
                default=defaults[CONF_WIND_THRESHOLD_MPH],
            ): vol.In([30, 40, 50, 60]),
        }
    )


async def _validate_input(hass, data: dict[str, Any]) -> None:
    LOGGER.debug(
        "Validating Weather Risk Bridge config for service %s",
        data[CONF_SERVICE_URL],
    )
    session = async_get_clientsession(hass)
    client = WeatherRiskBridgeClient(
        session=session,
        service_url=data[CONF_SERVICE_URL],
        bearer_token=(data.get(CONF_BEARER_TOKEN) or "").strip() or None,
    )
    await client.async_healthcheck()
    await client.async_snapshot(
        latitude=data[CONF_LATITUDE],
        longitude=data[CONF_LONGITUDE],
        label=data.get(CONF_LABEL) or None,
        wind_threshold_mph=int(data[CONF_WIND_THRESHOLD_MPH]),
    )


class WeatherRiskBridgeConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None):
        defaults = {
            CONF_SERVICE_URL: DEFAULT_SERVICE_URL,
            CONF_BEARER_TOKEN: "",
            CONF_LABEL: "",
            CONF_LATITUDE: self.hass.config.latitude,
            CONF_LONGITUDE: self.hass.config.longitude,
            CONF_WIND_THRESHOLD_MPH: DEFAULT_WIND_THRESHOLD_MPH,
        }
        errors: dict[str, str] = {}
        if user_input is not None:
            try:
                await _validate_input(self.hass, user_input)
            except ClientError as err:
                LOGGER.warning(
                    "Weather Risk Bridge config flow could not connect to %s: %s",
                    user_input[CONF_SERVICE_URL],
                    err,
                )
                errors["base"] = "cannot_connect"
            except Exception:
                LOGGER.exception("Unexpected Weather Risk Bridge config flow failure")
                errors["base"] = "unknown"
            else:
                await self.async_set_unique_id(
                    f"{user_input[CONF_LATITUDE]:.4f}:{user_input[CONF_LONGITUDE]:.4f}:{(user_input.get(CONF_LABEL) or '').strip().lower()}"
                )
                self._abort_if_unique_id_configured()
                return self.async_create_entry(
                    title=entry_title_from_config(user_input),
                    data=user_input,
                )

        return self.async_show_form(
            step_id="user",
            data_schema=_build_schema(defaults),
            errors=errors,
        )

    async def async_step_reconfigure(self, user_input: dict[str, Any] | None = None):
        entry = self._get_reconfigure_entry()
        defaults = merge_entry_config(entry)
        errors: dict[str, str] = {}
        if user_input is not None:
            try:
                await _validate_input(self.hass, user_input)
            except ClientError as err:
                LOGGER.warning(
                    "Weather Risk Bridge reconfigure could not connect to %s: %s",
                    user_input[CONF_SERVICE_URL],
                    err,
                )
                errors["base"] = "cannot_connect"
            except Exception:
                LOGGER.exception("Unexpected Weather Risk Bridge reconfigure failure")
                errors["base"] = "unknown"
            else:
                self.hass.config_entries.async_update_entry(
                    entry,
                    data=user_input,
                    title=entry_title_from_config(user_input),
                )
                return self.async_abort(reason="reconfigure_successful")

        return self.async_show_form(
            step_id="reconfigure",
            data_schema=_build_schema(defaults),
            errors=errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: config_entries.ConfigEntry):
        return WeatherRiskBridgeOptionsFlow(config_entry)


class WeatherRiskBridgeOptionsFlow(config_entries.OptionsFlow):
    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        self._config_entry = config_entry

    async def async_step_init(self, user_input: dict[str, Any] | None = None):
        merged = merge_entry_config(self._config_entry)
        defaults = {
            CONF_SERVICE_URL: merged[CONF_SERVICE_URL],
            CONF_BEARER_TOKEN: merged.get(CONF_BEARER_TOKEN, ""),
            CONF_LABEL: merged.get(CONF_LABEL, ""),
            CONF_LATITUDE: merged[CONF_LATITUDE],
            CONF_LONGITUDE: merged[CONF_LONGITUDE],
            CONF_WIND_THRESHOLD_MPH: merged[CONF_WIND_THRESHOLD_MPH],
        }
        errors: dict[str, str] = {}
        if user_input is not None:
            try:
                await _validate_input(self.hass, user_input)
            except ClientError as err:
                LOGGER.warning(
                    "Weather Risk Bridge options flow could not connect to %s: %s",
                    user_input[CONF_SERVICE_URL],
                    err,
                )
                errors["base"] = "cannot_connect"
            except Exception:
                LOGGER.exception("Unexpected Weather Risk Bridge options flow failure")
                errors["base"] = "unknown"
            else:
                return self.async_create_entry(title="", data=user_input)
        return self.async_show_form(
            step_id="init",
            data_schema=_build_schema(defaults),
            errors=errors,
        )
