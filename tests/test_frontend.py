"""Regression tests for Lovelace resource-version registration."""

from __future__ import annotations

import asyncio
import importlib.util
from pathlib import Path
import sys
import types
import unittest


ROOT = Path(__file__).parents[1]
FRONTEND_PATH = ROOT / "custom_components" / "weather_risk_bridge" / "frontend.py"
CONST_PATH = ROOT / "custom_components" / "weather_risk_bridge" / "const.py"


def _install_home_assistant_stubs() -> object:
    """Load frontend helpers without requiring a full HA runtime."""
    homeassistant = types.ModuleType("homeassistant")
    components = types.ModuleType("homeassistant.components")
    http = types.ModuleType("homeassistant.components.http")
    core = types.ModuleType("homeassistant.core")
    helpers = types.ModuleType("homeassistant.helpers")
    event = types.ModuleType("homeassistant.helpers.event")
    setup = types.ModuleType("homeassistant.setup")

    class StaticPathConfig:
        def __init__(self, **kwargs):
            self.kwargs = kwargs

    http.StaticPathConfig = StaticPathConfig
    core.HomeAssistant = object
    event.async_call_later = lambda *_args, **_kwargs: None
    setup.async_when_setup = lambda *_args, **_kwargs: None

    sys.modules.update(
        {
            "homeassistant": homeassistant,
            "homeassistant.components": components,
            "homeassistant.components.http": http,
            "homeassistant.core": core,
            "homeassistant.helpers": helpers,
            "homeassistant.helpers.event": event,
            "homeassistant.setup": setup,
        }
    )

    custom_components = types.ModuleType("custom_components")
    integration = types.ModuleType("custom_components.weather_risk_bridge")
    integration.__path__ = [str(CONST_PATH.parent)]
    sys.modules["custom_components"] = custom_components
    sys.modules["custom_components.weather_risk_bridge"] = integration

    const_spec = importlib.util.spec_from_file_location(
        "custom_components.weather_risk_bridge.const", CONST_PATH
    )
    const_module = importlib.util.module_from_spec(const_spec)
    sys.modules[const_spec.name] = const_module
    const_spec.loader.exec_module(const_module)

    frontend_spec = importlib.util.spec_from_file_location(
        "custom_components.weather_risk_bridge.frontend", FRONTEND_PATH
    )
    frontend_module = importlib.util.module_from_spec(frontend_spec)
    sys.modules[frontend_spec.name] = frontend_module
    frontend_spec.loader.exec_module(frontend_module)
    return frontend_module


frontend = _install_home_assistant_stubs()


class Resources:
    def __init__(self, items):
        self.items = items
        self.updates = []

    async def async_get_info(self):
        return {"resources": len(self.items)}

    def async_items(self):
        return self.items

    async def async_update_item(self, item_id, updates):
        self.updates.append((item_id, updates))


class Hass:
    def __init__(self, data):
        self.data = data


class TestLovelaceCompatibility(unittest.TestCase):
    def tearDown(self):
        sys.modules.pop("homeassistant.components.lovelace.const", None)

    def test_legacy_dict_layout_updates_resource(self):
        resources = Resources([{"id": "old", "url": "/weather_risk_bridge/weather-risk-bridge-card.js?v=0.1.5"}])
        hass = Hass({"lovelace": {"mode": "storage", "resources": resources}})

        asyncio.run(frontend._async_register_lovelace_resource(hass))

        self.assertEqual(
            resources.updates,
            [("old", {"res_type": "module", "url": frontend.card_resource_url()})],
        )

    def test_typed_lovelace_data_key_updates_resource(self):
        typed_key = object()
        const = types.ModuleType("homeassistant.components.lovelace.const")
        const.LOVELACE_DATA = typed_key
        sys.modules[const.__name__] = const

        resources = Resources([{"id": "old", "url": "/weather_risk_bridge/weather-risk-bridge-card.js?v=0.1.5"}])
        lovelace = types.SimpleNamespace(mode="storage", resources=resources)
        hass = Hass({typed_key: lovelace})

        asyncio.run(frontend._async_register_lovelace_resource(hass))

        self.assertEqual(resources.updates[0][1]["url"], frontend.card_resource_url())

    def test_current_resource_mode_is_supported(self):
        typed_key = object()
        const = types.ModuleType("homeassistant.components.lovelace.const")
        const.LOVELACE_DATA = typed_key
        sys.modules[const.__name__] = const

        resources = Resources([{"id": "old", "url": "/weather_risk_bridge/weather-risk-bridge-card.js?v=0.1.5"}])
        lovelace = types.SimpleNamespace(resource_mode="storage", resources=resources)
        hass = Hass({typed_key: lovelace})

        asyncio.run(frontend._async_register_lovelace_resource(hass))

        self.assertEqual(resources.updates[0][1]["url"], frontend.card_resource_url())


if __name__ == "__main__":
    unittest.main()
