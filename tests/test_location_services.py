"""Regression tests for place search and location update services."""

from __future__ import annotations

import asyncio
import importlib.util
import json
import sys
import types
import unittest
from pathlib import Path


ROOT = Path(__file__).parents[1]
PACKAGE_PATH = ROOT / "custom_components" / "weather_risk_bridge"


def _load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def _install_stubs() -> None:
    """Install minimal homeassistant / aiohttp / voluptuous stubs."""

    if "homeassistant" in sys.modules and getattr(
        sys.modules["homeassistant"], "__wrb_stubs__", False
    ):
        return

    homeassistant = types.ModuleType("homeassistant")
    homeassistant.__wrb_stubs__ = True
    components = types.ModuleType("homeassistant.components")
    auth = types.ModuleType("homeassistant.auth")
    auth_const = types.ModuleType("homeassistant.auth.const")
    config_entries = types.ModuleType("homeassistant.config_entries")
    const = types.ModuleType("homeassistant.const")
    core = types.ModuleType("homeassistant.core")
    exceptions = types.ModuleType("homeassistant.exceptions")
    helpers = types.ModuleType("homeassistant.helpers")
    config_validation = types.ModuleType("homeassistant.helpers.config_validation")
    aiohttp_client = types.ModuleType("homeassistant.helpers.aiohttp_client")

    const.CONF_LATITUDE = "latitude"
    const.CONF_LONGITUDE = "longitude"

    class SupportsResponse:
        ONLY = "only"
        OPTIONAL = "optional"
        NEVER = "never"

    class ServiceResponse(dict):
        pass

    class ServiceCall:
        def __init__(self, data, user_id=None):
            self.data = data
            self.context = types.SimpleNamespace(user_id=user_id)

    class _ConfigEntries:
        def __init__(self):
            self.entries = []
            self.reloads = []
            self.updates = []

        def async_entries(self, domain):
            return [e for e in self.entries if e.domain == domain]

        async def async_reload(self, entry_id):
            self.reloads.append(entry_id)

        def async_update_entry(self, entry, **changes):
            self.updates.append((entry.entry_id, changes))
            if "data" in changes:
                entry.data = changes["data"]
            if "options" in changes:
                entry.options = changes["options"]
            if "title" in changes:
                entry.title = changes["title"]

    class _Auth:
        def __init__(self):
            self.users = {}

        async def async_get_user(self, user_id):
            return self.users.get(user_id)

    class _SnapshotResponse:
        status = 200

        async def json(self):
            return {"ok": True}

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return False

    class _SnapshotSession:
        """Fake aiohttp session for the api client's snapshot validation."""

        def get(self, url, params=None, headers=None):
            return _SnapshotResponse()

    class _Context:
        def __init__(self, user_id=None):
            self.user_id = user_id

    class HomeAssistant:
        def __init__(self):
            self.config = types.SimpleNamespace(latitude=40.7128, longitude=-74.0060)
            self.data = {}
            self.config_entries = _ConfigEntries()
            self.auth = _Auth()
            self.services = types.SimpleNamespace(
                async_services=lambda: {}
            )
            self._session = _SnapshotSession()

        def _snapshot_session(self):
            return self._session

    class ServiceValidationError(Exception):
        pass

    class Unauthorized(Exception):
        def __init__(self, *args, context=None, permission=None, **kwargs):
            super().__init__(*args)
            self.context = context
            self.permission = permission

    core.HomeAssistant = HomeAssistant
    core.ServiceCall = ServiceCall
    core.ServiceResponse = ServiceResponse
    core.SupportsResponse = SupportsResponse
    core.callback = lambda func: func
    config_entries.ConfigEntry = object
    exceptions.ServiceValidationError = ServiceValidationError
    exceptions.Unauthorized = Unauthorized
    auth_const.POLICY_EDIT_CONFIG_ENTRIES = "config_entries:edit"
    config_validation.string = lambda value: str(value)
    config_validation.boolean = lambda value: bool(value)
    aiohttp_client.async_get_clientsession = lambda hass: getattr(hass, "_session", None)

    aiohttp = types.ModuleType("aiohttp")
    aiohttp.ClientError = type("ClientError", (Exception,), {})
    aiohttp.ClientSession = object
    aiohttp.ClientResponseError = type(
        "ClientResponseError", (aiohttp.ClientError,), {}
    )

    voluptuous = types.ModuleType("voluptuous")

    class _Marker:
        def __init__(self, name):
            self.name = name

        def __call__(self, *args, **kwargs):
            if self.name in ("Optional", "Required"):
                key = args[0] if args else kwargs.get("key")
                default = kwargs.get("default")
                return _SchemaField(key, default)

            return lambda value: value

    class _SchemaField:
        def __init__(self, key, default):
            self.key = key
            self.default = default

    class Schema:
        def __init__(self, spec):
            self.spec = spec

        def __call__(self, value):
            return value

    voluptuous.Schema = Schema
    for marker in ("Optional", "Required", "All", "Coerce", "Range", "In"):
        setattr(voluptuous, marker, _Marker(marker))

    custom_components = types.ModuleType("custom_components")
    package = types.ModuleType("custom_components.weather_risk_bridge")
    package.__path__ = [str(PACKAGE_PATH)]

    sys.modules.update(
        {
            "homeassistant": homeassistant,
            "homeassistant.components": components,
            "homeassistant.auth": auth,
            "homeassistant.auth.const": auth_const,
            "homeassistant.config_entries": config_entries,
            "homeassistant.const": const,
            "homeassistant.core": core,
            "homeassistant.exceptions": exceptions,
            "homeassistant.helpers": helpers,
            "homeassistant.helpers.config_validation": config_validation,
            "homeassistant.helpers.aiohttp_client": aiohttp_client,
            "aiohttp": aiohttp,
            "voluptuous": voluptuous,
            "custom_components": custom_components,
            "custom_components.weather_risk_bridge": package,
        }
    )


_install_stubs()

const = _load_module(
    "custom_components.weather_risk_bridge.const", PACKAGE_PATH / "const.py"
)
helpers = _load_module(
    "custom_components.weather_risk_bridge.helpers", PACKAGE_PATH / "helpers.py"
)
geocoding = _load_module(
    "custom_components.weather_risk_bridge.geocoding", PACKAGE_PATH / "geocoding.py"
)
services = _load_module(
    "custom_components.weather_risk_bridge.services", PACKAGE_PATH / "services.py"
)


class _FakeResponse:
    def __init__(self, status, payload):
        self.status = status
        self._payload = payload

    async def json(self):
        return self._payload

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        return False


class _FakeSession:
    def __init__(self, status=200, payload=None):
        self.status = status
        self.payload = payload or {}
        self.calls = []

    def get(self, url, params=None, timeout=None):
        self.calls.append({"url": url, "params": params})
        return _FakeResponse(self.status, self.payload)


class _Entry:
    def __init__(self, entry_id, title, data, options=None, domain="weather_risk_bridge"):
        self.entry_id = entry_id
        self.unique_id = entry_id
        self.domain = domain
        self.title = title
        self.data = data
        self.options = options or {}


class GeocodingTests(unittest.IsolatedAsyncioTestCase):
    async def test_search_returns_us_candidates_first(self):
        session = _FakeSession(
            payload={
                "results": [
                    {"name": "Austin", "latitude": 43.66, "longitude": -92.97,
                     "country_code": "US"},
                    {"name": "Austin", "latitude": -31.95, "longitude": 116.02,
                     "country_code": "AU", "admin1": "Western Australia",
                     "country": "Australia"},
                    {"name": "Austin", "latitude": 30.26, "longitude": -97.74,
                     "admin1": "Texas", "country": "United States",
                     "country_code": "US"},
                ]
            }
        )
        results = await geocoding.async_search_locations(None, session, "Austin")
        self.assertEqual(len(results), 3)
        # US candidates first (stable within a country); non-US last.
        self.assertEqual(results[0]["country_code"], "US")
        self.assertEqual(results[1]["country_code"], "US")
        self.assertEqual(results[2]["country_code"], "AU")
        self.assertIn("Texas", " ".join(r["label"] for r in results))

    async def test_search_no_results(self):
        session = _FakeSession(payload={})
        self.assertEqual(await geocoding.async_search_locations(None, session, "zzz"), [])

    async def test_search_http_error_raises(self):
        session = _FakeSession(status=503, payload={})
        with self.assertRaises(geocoding.GeocodingError):
            await geocoding.async_search_locations(None, session, "Austin")

    async def test_search_empty_query(self):
        session = _FakeSession(payload={})
        self.assertEqual(await geocoding.async_search_locations(None, session, "  "), [])
        self.assertEqual(session.calls, [])


class ServiceHelperTests(unittest.IsolatedAsyncioTestCase):
    def _hass_with_entries(self, entries):
        hass = services.HomeAssistant()
        hass.config_entries.entries = entries
        return hass

    def test_find_entry_by_slug(self):
        entry = _Entry(
            "e1",
            "Home",
            {
                "service_url": "http://x",
                "latitude": 30.0,
                "longitude": -97.0,
                "wind_threshold_mph": 40,
                "label": "Home",
            },
        )
        hass = self._hass_with_entries([entry])
        found = services._find_entry(hass, services.ServiceCall({"location": "home"}))
        self.assertIs(found, entry)

    def test_find_entry_requires_disambiguation(self):
        entries = [
            _Entry("e1", "Home", {"latitude": 1, "longitude": 2, "label": "Home"}),
            _Entry("e2", "Cabin", {"latitude": 3, "longitude": 4, "label": "Cabin"}),
        ]
        hass = self._hass_with_entries(entries)
        with self.assertRaises(services.ServiceValidationError):
            services._find_entry(hass, services.ServiceCall({}))

    def test_validate_coordinates_rejects_out_of_range(self):
        with self.assertRaises(services.ServiceValidationError):
            services._validate_coordinates(120, 0)
        with self.assertRaises(services.ServiceValidationError):
            services._validate_coordinates(0, -200)

    async def test_resolve_coordinates_prefers_explicit(self):
        hass = services.HomeAssistant()
        call = services.ServiceCall(
            {"latitude": 10.5, "longitude": -20.25, "use_home_assistant": False}
        )
        self.assertEqual(
            await services._async_resolve_coordinates(hass, call), (10.5, -20.25)
        )

    async def test_resolve_coordinates_home_assistant(self):
        hass = services.HomeAssistant()
        call = services.ServiceCall({"use_home_assistant": True})
        self.assertEqual(
            await services._async_resolve_coordinates(hass, call), (40.7128, -74.006)
        )

    async def test_resolve_coordinates_half_pair_rejected(self):
        hass = services.HomeAssistant()
        call = services.ServiceCall({"latitude": 10.5})
        with self.assertRaises(services.ServiceValidationError):
            await services._async_resolve_coordinates(hass, call)

    async def test_resolve_coordinates_query_picks_result(self):
        hass = services.HomeAssistant()

        async def fake_search(hass_arg, session, query):
            return [
                {"label": "One", "latitude": 1.0, "longitude": 2.0, "name": "One"},
                {"label": "Two", "latitude": 3.0, "longitude": 4.0, "name": "Two"},
            ]

        original = services.async_search_locations
        services.async_search_locations = fake_search
        try:
            call = services.ServiceCall({"query": "place", "result": 2})
            self.assertEqual(
                await services._async_resolve_coordinates(hass, call), (3.0, 4.0)
            )
        finally:
            services.async_search_locations = original

    async def test_resolve_coordinates_query_result_out_of_range(self):
        hass = services.HomeAssistant()

        async def fake_search(hass_arg, session, query):
            return [{"label": "One", "latitude": 1.0, "longitude": 2.0, "name": "One"}]

        original = services.async_search_locations
        services.async_search_locations = fake_search
        try:
            call = services.ServiceCall({"query": "place", "result": 5})
            with self.assertRaises(services.ServiceValidationError):
                await services._async_resolve_coordinates(hass, call)
        finally:
            services.async_search_locations = original

    async def test_update_location_updates_data_and_reloads(self):
        entry = _Entry(
            "e1",
            "Home",
            {
                "service_url": "http://x",
                "label": "Home",
                "latitude": 30.0,
                "longitude": -97.0,
                "wind_threshold_mph": 40,
            },
        )
        hass = self._hass_with_entries([entry])
        call = services.ServiceCall(
            {"location": "home", "latitude": 33.0, "longitude": -96.0}
        )
        response = await services._async_update_location(hass, call)
        self.assertEqual(entry.data["latitude"], 33.0)
        self.assertEqual(entry.data["longitude"], -96.0)
        # The targeting key is persisted so label-less entries stay addressable
        # after a coordinate change regenerates their slug.
        self.assertEqual(entry.data["location_key"], "home")
        self.assertEqual(hass.config_entries.reloads, ["e1"])
        self.assertEqual(response["latitude"], 33.0)
        self.assertEqual(response["title"], "Home")
        self.assertEqual(response["location"], "home")

    async def test_update_location_alias_survives_coordinate_slug_change(self):
        # Label-less entry: slug derives from coordinates and changes on update.
        entry = _Entry(
            "e1",
            "30.0000,-97.0000",
            {
                "service_url": "http://x",
                "latitude": 30.0,
                "longitude": -97.0,
                "wind_threshold_mph": 40,
            },
        )
        hass = self._hass_with_entries([entry])
        first = services.ServiceCall(
            {"location": "30_0000_97_0000", "latitude": 33.0, "longitude": -96.0}
        )
        await services._async_update_location(hass, first)
        # Old slug no longer matches, but the persisted alias does.
        second = services.ServiceCall(
            {"location": "30_0000_97_0000", "latitude": 34.0, "longitude": -95.0}
        )
        response = await services._async_update_location(hass, second)
        self.assertEqual(entry.data["latitude"], 34.0)
        self.assertEqual(response["location"], "30_0000_97_0000")

    async def test_register_services_binds_hass(self):
        hass = self._hass_with_entries([])
        registered = {}

        def fake_register(domain, service, handler, schema=None, supports_response=None):
            registered[service] = handler

        hass.services = types.SimpleNamespace(
            async_services=lambda: {},
            async_register=fake_register,
        )

        async def fake_search(hass_arg, session, query):
            return [{"label": "One", "latitude": 1.0, "longitude": 2.0, "name": "One"}]

        original = services.async_search_locations
        services.async_search_locations = fake_search
        try:
            services.async_register_services(hass)
            self.assertIn(services.SERVICE_RESOLVE_LOCATION, registered)
            self.assertIn(services.SERVICE_UPDATE_LOCATION, registered)
            # Handlers are partials with hass bound: calling them needs only a call.
            search = registered[services.SERVICE_RESOLVE_LOCATION]
            result = await search(services.ServiceCall({"query": "Austin"}))
            self.assertIn("locations", result)
        finally:
            services.async_search_locations = original

    async def test_update_location_updates_options_when_owned_there(self):
        entry = _Entry(
            "e1",
            "Home",
            {"service_url": "http://x", "wind_threshold_mph": 40, "label": "Home"},
            options={"latitude": 30.0, "longitude": -97.0},
        )
        hass = self._hass_with_entries([entry])
        call = services.ServiceCall({"location": "home", "use_home_assistant": True})
        await services._async_update_location(hass, call)
        self.assertNotIn("latitude", entry.data)
        self.assertEqual(entry.options["latitude"], 40.7128)
        self.assertEqual(entry.options["longitude"], -74.006)

    async def test_update_location_requires_change_source(self):
        entry = _Entry("e1", "Home", {"latitude": 30.0, "longitude": -97.0})
        hass = self._hass_with_entries([entry])
        call = services.ServiceCall({"location": "home"})
        with self.assertRaises(services.ServiceValidationError):
            await services._async_update_location(hass, call)

    async def test_update_location_validates_snapshot_before_commit(self):
        entry = _Entry("e1", "Home", {"latitude": 30.0, "longitude": -97.0, "label": "Home"})
        hass = self._hass_with_entries([entry])
        # Make the snapshot validation fail with a transport error.
        class _FailingSession:
            def get(self, url, params=None, headers=None):
                raise aiohttp.ClientError("connection refused")

        hass._session = _FailingSession()
        call = services.ServiceCall({"location": "home", "latitude": 31.0, "longitude": -96.0})
        with self.assertRaises(services.ServiceValidationError):
            await services._async_update_location(hass, call)
        # Nothing was persisted or reloaded.
        self.assertEqual(entry.data["latitude"], 30.0)
        self.assertEqual(hass.config_entries.reloads, [])

    async def test_update_location_restores_config_on_false_reload(self):
        # async_reload returns False when setup fails without raising.
        entry = _Entry("e1", "Home", {"latitude": 30.0, "longitude": -97.0, "label": "Home"})
        hass = self._hass_with_entries([entry])

        async def false_reload(entry_id):
            return False

        hass.config_entries.async_reload = false_reload
        call = services.ServiceCall({"location": "home", "latitude": 31.0, "longitude": -96.0})
        with self.assertRaises(services.ServiceValidationError):
            await services._async_update_location(hass, call)
        self.assertEqual(entry.data["latitude"], 30.0)

    async def test_update_location_restores_config_on_reload_failure(self):
        entry = _Entry("e1", "Home", {"latitude": 30.0, "longitude": -97.0, "label": "Home"})
        hass = self._hass_with_entries([entry])
        reloads = []

        async def flaky_reload(entry_id):
            reloads.append(entry_id)
            if len(reloads) == 1:
                raise RuntimeError("setup failed with new coordinates")

        hass.config_entries.async_reload = flaky_reload
        call = services.ServiceCall({"location": "home", "latitude": 31.0, "longitude": -96.0})
        with self.assertRaises(services.ServiceValidationError):
            await services._async_update_location(hass, call)
        # The previous coordinates were restored and a rollback reload ran.
        self.assertEqual(entry.data["latitude"], 30.0)
        self.assertEqual(reloads, ["e1", "e1"])

    async def test_update_location_serializes_concurrent_calls(self):
        # Two overlapping updates must not interleave: the second commit sees
        # the first's result and the final config matches the second call.
        entry = _Entry("e1", "Home", {"latitude": 30.0, "longitude": -97.0, "label": "Home"})
        hass = self._hass_with_entries([entry])
        reload_started = asyncio.Event()
        release_reload = asyncio.Event()

        async def slow_reload(entry_id):
            reload_started.set()
            await release_reload.wait()
            return True

        hass.config_entries.async_reload = slow_reload

        async def first():
            return await services._async_update_location(
                hass, services.ServiceCall(
                    {"location": "home", "latitude": 31.0, "longitude": -96.0}
                )
            )

        async def second():
            # Start once the first call is inside its reload.
            await reload_started.wait()
            release_reload.set()
            return await services._async_update_location(
                hass, services.ServiceCall(
                    {"location": "home", "latitude": 32.0, "longitude": -95.0}
                )
            )

        first_response, second_response = await asyncio.gather(first(), second())
        self.assertEqual(first_response["latitude"], 31.0)
        self.assertEqual(second_response["latitude"], 32.0)
        self.assertEqual(entry.data["latitude"], 32.0)
        self.assertEqual(entry.data["longitude"], -95.0)

    async def test_update_location_requires_admin_for_identified_user(self):
        entry = _Entry("e1", "Home", {"latitude": 30.0, "longitude": -97.0, "label": "Home"})
        hass = self._hass_with_entries([entry])
        non_admin = types.SimpleNamespace(is_admin=False)
        admin = types.SimpleNamespace(is_admin=True)
        hass.auth.users["u-nonadmin"] = non_admin
        hass.auth.users["u-admin"] = admin
        with self.assertRaises(services.Unauthorized):
            await services._async_update_location(
                hass, services.ServiceCall(
                    {"location": "home", "latitude": 31.0, "longitude": -96.0},
                    user_id="u-nonadmin",
                )
            )
        # No reload or update happened for the rejected call.
        self.assertEqual(hass.config_entries.reloads, [])
        # Admin user succeeds.
        await services._async_update_location(
            hass, services.ServiceCall(
                {"location": "home", "latitude": 31.0, "longitude": -96.0},
                user_id="u-admin",
            )
        )
        self.assertEqual(entry.data["latitude"], 31.0)
        # System context (no user id) is allowed.
        entry2 = _Entry("e2", "Cabin", {"latitude": 1.0, "longitude": 2.0, "label": "Cabin"})
        hass.config_entries.entries.append(entry2)
        await services._async_update_location(
            hass, services.ServiceCall(
                {"location": "cabin", "latitude": 3.0, "longitude": 4.0},
            )
        )
        self.assertEqual(entry2.data["latitude"], 3.0)

    async def test_update_location_initializes_alias_from_pre_update_slug(self):
        # Label-less entry updated via single-entry fallback: alias must come
        # from the pre-update slug so old entity ids stay addressable.
        entry = _Entry(
            "e1",
            "30.0000,-97.0000",
            {
                "service_url": "http://x",
                "latitude": 30.0,
                "longitude": -97.0,
                "wind_threshold_mph": 40,
            },
        )
        hass = self._hass_with_entries([entry])
        call = services.ServiceCall({"latitude": 33.0, "longitude": -96.0})
        response = await services._async_update_location(hass, call)
        self.assertEqual(entry.data["location_key"], "30_0000_97_0000")
        self.assertEqual(response["location"], "30_0000_97_0000")

    async def test_update_location_preserves_existing_alias(self):
        entry = _Entry(
            "e1",
            "Home",
            {
                "service_url": "http://x",
                "label": "Home",
                "latitude": 30.0,
                "longitude": -97.0,
                "wind_threshold_mph": 40,
                "location_key": "home",
            },
        )
        hass = self._hass_with_entries([entry])
        # Targeted by an unrelated spelling; the stored alias must survive.
        call = services.ServiceCall({"location": "home", "latitude": 34.0, "longitude": -95.0})
        await services._async_update_location(hass, call)
        self.assertEqual(entry.data["location_key"], "home")

    async def test_update_location_missing_entry(self):
        hass = self._hass_with_entries([])
        call = services.ServiceCall({"location": "home", "latitude": 1.0, "longitude": 2.0})
        with self.assertRaises(services.ServiceValidationError):
            await services._async_update_location(hass, call)


if __name__ == "__main__":
    unittest.main()
